use crate::db::DbState;
use crate::models::{AppSettings, EmailTemplate};
use tauri::State;

const SETTINGS_ID: &str = "default";

const DEFAULT_EMAIL_TEMPLATES: &str = r#"[
  {"id":"default-invoice","name":"Default Invoice Email","subject":"Invoice {{invoiceNumber}} from {{companyName}}","body":"<h2>Invoice {{invoiceNumber}}</h2>\n<p>Dear {{clientName}},</p>\n<p>Please find attached your invoice for the amount of ${{total}}.</p>\n<p>Due date: {{dueDate}}</p>\n<p>Thank you for your business!</p>\n<br>\n<p>Best regards,<br>{{companyName}}</p>","type":"invoice"},
  {"id":"default-reminder","name":"Default Payment Reminder","subject":"Payment Reminder - Invoice {{invoiceNumber}}","body":"<h2>Payment Reminder</h2>\n<p>Dear {{clientName}},</p>\n<p>This is a friendly reminder that invoice {{invoiceNumber}} for ${{total}} is still pending payment.</p>\n<p>Due date: {{dueDate}}</p>\n<p>Please process the payment at your earliest convenience.</p>\n<br>\n<p>Best regards,<br>{{companyName}}</p>","type":"reminder"},
  {"id":"default-overdue","name":"Default Overdue Notice","subject":"OVERDUE: Invoice {{invoiceNumber}}","body":"<h2>Overdue Payment Notice</h2>\n<p>Dear {{clientName}},</p>\n<p><strong>URGENT:</strong> Invoice {{invoiceNumber}} for ${{total}} is now overdue.</p>\n<p>Original due date: {{dueDate}}</p>\n<p>Please contact us immediately to resolve this matter.</p>\n<br>\n<p>Best regards,<br>{{companyName}}</p>","type":"overdue"}
]"#;

fn default_settings() -> AppSettings {
    AppSettings {
        smtp: serde_json::json!({}),
        email_templates: serde_json::from_str(DEFAULT_EMAIL_TEMPLATES).unwrap_or_default(),
    }
}

pub fn get_settings_impl(conn: &rusqlite::Connection) -> Result<AppSettings, String> {
    let mut stmt = conn
        .prepare("SELECT smtp, emailTemplates FROM app_settings WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([SETTINGS_ID]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let smtp_str: String = row.get(0).unwrap_or_else(|_| "{}".to_string());
        let templates_str: String = row.get(1).unwrap_or_else(|_| "[]".to_string());

        let smtp: serde_json::Value = serde_json::from_str(&smtp_str).unwrap_or(serde_json::json!({}));
        let templates: Vec<EmailTemplate> = serde_json::from_str(&templates_str).unwrap_or_else(|_| {
            serde_json::from_str(DEFAULT_EMAIL_TEMPLATES).unwrap_or_default()
        });

        Ok(AppSettings {
            smtp,
            email_templates: if templates.is_empty() {
                serde_json::from_str(DEFAULT_EMAIL_TEMPLATES).unwrap_or_default()
            } else {
                templates
            },
        })
    } else {
        Ok(default_settings())
    }
}

#[tauri::command]
pub fn get_settings(db: State<DbState>) -> Result<AppSettings, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    get_settings_impl(&conn)
}

#[tauri::command]
pub fn set_settings(db: State<DbState>, settings: AppSettings) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let smtp_str = serde_json::to_string(&settings.smtp).map_err(|e| e.to_string())?;
    let templates_str =
        serde_json::to_string(&settings.email_templates).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO app_settings (id, smtp, emailTemplates)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(id) DO UPDATE SET smtp = excluded.smtp, emailTemplates = excluded.emailTemplates",
        rusqlite::params![SETTINGS_ID, smtp_str, templates_str],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
