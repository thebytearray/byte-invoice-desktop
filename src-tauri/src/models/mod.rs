use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Company {
    pub name: String,
    pub address: String,
    pub city: String,
    pub state: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub zip_code: Option<String>,
    pub country: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone: Option<String>,
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub website: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tax_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logo: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Client {
    pub id: String,
    pub name: String,
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone: Option<String>,
    pub address: String,
    pub city: String,
    pub state: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub zip_code: Option<String>,
    pub country: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub advance_payment: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Product {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub price: Option<f64>,
    pub sku: String,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InvoiceItem {
    pub product_id: String,
    pub product_name: String,
    pub description: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub total: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Invoice {
    pub id: String,
    pub invoice_number: String,
    pub client_id: String,
    pub client_name: String,
    pub issue_date: String,
    pub due_date: String,
    pub items: Vec<InvoiceItem>,
    pub subtotal: f64,
    pub tax_rate: f64,
    pub tax_amount: f64,
    pub discount_rate: f64,
    pub discount_amount: f64,
    pub total: f64,
    pub status: InvoiceStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email_sent: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_reminder_sent: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum InvoiceStatus {
    Draft,
    Sent,
    Paid,
    Overdue,
}

impl InvoiceStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            InvoiceStatus::Draft => "draft",
            InvoiceStatus::Sent => "sent",
            InvoiceStatus::Paid => "paid",
            InvoiceStatus::Overdue => "overdue",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "sent" => InvoiceStatus::Sent,
            "paid" => InvoiceStatus::Paid,
            "overdue" => InvoiceStatus::Overdue,
            _ => InvoiceStatus::Draft,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct SMTPSettings {
    pub host: String,
    pub port: i32,
    pub secure: bool,
    pub username: String,
    pub password: String,
    pub from_name: String,
    pub from_email: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailTemplate {
    pub id: String,
    pub name: String,
    pub subject: String,
    pub body: String,
    #[serde(rename = "type")]
    pub template_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(default)]
    pub smtp: serde_json::Value,
    pub email_templates: Vec<EmailTemplate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InitializeDataResult {
    pub company: Company,
    pub clients: Vec<Client>,
    pub products: Vec<Product>,
    pub invoices: Vec<Invoice>,
    pub settings: AppSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    pub company: Company,
    pub clients: Vec<Client>,
    pub products: Vec<Product>,
    pub invoices: Vec<Invoice>,
    pub settings: AppSettings,
    pub version: String,
    pub export_date: String,
}
