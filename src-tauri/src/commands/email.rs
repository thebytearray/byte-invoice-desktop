use crate::commands::settings;
use crate::db::DbState;
use lettre::{
    message::header::ContentType, transport::smtp::authentication::Credentials, Message,
    SmtpTransport, Transport,
};
use serde::Deserialize;
use tauri::State;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SmtpConfig {
    host: String,
    port: i32,
    secure: bool,
    username: String,
    password: String,
    from_name: String,
    from_email: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendEmailPayload {
    pub to: String,
    pub subject: String,
    pub html_body: String,
    pub pdf_base64: Option<String>,
    pub pdf_filename: Option<String>,
}

#[tauri::command]
pub async fn send_email(db: State<'_, DbState>, payload: SendEmailPayload) -> Result<(), String> {
    let settings = {
        let conn = db.lock().map_err(|e| e.to_string())?;
        settings::get_settings_impl(&conn)?
    };

    let smtp: SmtpConfig = serde_json::from_value(settings.smtp.clone())
        .map_err(|_| "SMTP settings not configured. Configure email in Settings.".to_string())?;

    if smtp.host.is_empty() || smtp.username.is_empty() || smtp.password.is_empty() {
        return Err("SMTP settings not configured. Configure email in Settings.".to_string());
    }

    let port = smtp.port as u16;
    if port == 0 {
        return Err("Invalid SMTP port.".to_string());
    }

    let from_addr = format!("\"{}\" <{}>", smtp.from_name, smtp.from_email)
        .parse()
        .map_err(|e: lettre::address::AddressError| e.to_string())?;

    let to_addr = payload
        .to
        .parse()
        .map_err(|e: lettre::address::AddressError| e.to_string())?;

    let message = if let (Some(base64_data), Some(filename)) =
        (payload.pdf_base64.clone(), payload.pdf_filename.clone())
    {
        let pdf_bytes =
            base64::Engine::decode(&base64::engine::general_purpose::STANDARD, &base64_data)
                .map_err(|e| format!("Invalid base64: {}", e))?;

        let attachment = lettre::message::Attachment::new(filename)
            .body(pdf_bytes, ContentType::parse("application/pdf").unwrap());

        Message::builder()
            .from(from_addr)
            .to(to_addr)
            .subject(&payload.subject)
            .multipart(
                lettre::message::MultiPart::mixed()
                    .singlepart(lettre::message::SinglePart::html(payload.html_body))
                    .singlepart(attachment),
            )
            .map_err(|e| e.to_string())?
    } else {
        Message::builder()
            .from(from_addr)
            .to(to_addr)
            .subject(&payload.subject)
            .header(ContentType::TEXT_HTML)
            .body(payload.html_body)
            .map_err(|e| e.to_string())?
    };

    let host = smtp.host.clone();
    let secure = smtp.secure;
    let username = smtp.username.clone();
    let password = smtp.password;

    let result = tokio::task::spawn_blocking(move || {
        let mailer = if secure {
            SmtpTransport::relay(&host)
        } else {
            SmtpTransport::starttls_relay(&host)
        }
        .map_err(|e| format!("SMTP relay error: {}", e))?
        .port(port)
        .credentials(Credentials::new(username, password))
        .build();

        mailer
            .send(&message)
            .map_err(|e| format!("Send failed: {}", e))
    })
    .await
    .map_err(|e| format!("Task failed: {}", e))?;

    result?;
    Ok(())
}
