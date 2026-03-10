use lettre::{
    message::header::ContentType, transport::smtp::authentication::Credentials, Message,
    SmtpTransport, Transport,
};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SmtpConfig {
    pub host: String,
    pub port: u16,
    pub secure: bool,
    pub username: String,
    pub password: String,
    pub from_name: String,
    pub from_email: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendEmailPayload {
    pub smtp: SmtpConfig,
    pub to: String,
    pub subject: String,
    pub html: String,
    pub pdf_base64: Option<String>,
    pub pdf_filename: Option<String>,
}

#[tauri::command]
pub fn send_email(payload: SendEmailPayload) -> Result<(), String> {
    let from_addr = format!(
        "\"{}\" <{}>",
        payload.smtp.from_name, payload.smtp.from_email
    )
    .parse()
    .map_err(|e: lettre::address::AddressError| e.to_string())?;

    let to_addr = payload
        .to
        .parse()
        .map_err(|e: lettre::address::AddressError| e.to_string())?;

    let message =
        if let (Some(base64_data), Some(filename)) = (payload.pdf_base64, payload.pdf_filename) {
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
                        .singlepart(lettre::message::SinglePart::html(payload.html))
                        .singlepart(attachment),
                )
                .map_err(|e| e.to_string())?
        } else {
            Message::builder()
                .from(from_addr)
                .to(to_addr)
                .subject(&payload.subject)
                .header(ContentType::TEXT_HTML)
                .body(payload.html)
                .map_err(|e| e.to_string())?
        };

    let mailer = if payload.smtp.secure {
        SmtpTransport::relay(&payload.smtp.host)
    } else {
        SmtpTransport::starttls_relay(&payload.smtp.host)
    }
    .map_err(|e| format!("SMTP relay error: {}", e))?
    .port(payload.smtp.port)
    .credentials(Credentials::new(
        payload.smtp.username.clone(),
        payload.smtp.password,
    ))
    .build();

    mailer
        .send(&message)
        .map_err(|e| format!("Send failed: {}", e))?;

    Ok(())
}
