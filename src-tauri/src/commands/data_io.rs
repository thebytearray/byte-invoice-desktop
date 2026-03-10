use crate::commands::{clients, company, invoices, products, settings};
use crate::db::DbState;
use crate::models::AppData;
use chrono::Utc;
use rusqlite::params;
use tauri::State;
use uuid::Uuid;

const APP_VERSION: &str = "1.0.0";

#[tauri::command]
pub fn export_data(db: State<DbState>) -> Result<AppData, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let company = company::get_company_impl(&conn)?.unwrap_or_else(company::default_company);
    let clients = clients::get_clients_impl(&conn)?;
    let products = products::get_products_impl(&conn)?;
    let invoices = invoices::get_invoices_impl(&conn)?;
    let settings = settings::get_settings_impl(&conn)?;

    Ok(AppData {
        company,
        clients,
        products,
        invoices,
        settings,
        version: APP_VERSION.to_string(),
        export_date: Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub fn import_data(db: State<DbState>, data: AppData) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;

    // Delete in order respecting FK (invoice_items has FK to invoices)
    tx.execute("DELETE FROM invoice_items", []).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM invoices", []).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM clients", []).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM products", []).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM company", []).map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM app_settings", []).map_err(|e| e.to_string())?;

    // Insert company
    tx.execute(
        "INSERT INTO company (id, name, address, city, state, zipCode, country, phone, email, website, taxId, logo)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            "default",
            data.company.name,
            data.company.address,
            data.company.city,
            data.company.state,
            data.company.zip_code,
            data.company.country,
            data.company.phone,
            data.company.email,
            data.company.website,
            data.company.tax_id,
            data.company.logo,
        ],
    )
    .map_err(|e| e.to_string())?;

    // Insert clients
    for c in &data.clients {
        tx.execute(
            "INSERT INTO clients (id, name, email, phone, address, city, state, zipCode, country, advancePayment)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                c.id,
                c.name,
                c.email,
                c.phone,
                c.address,
                c.city,
                c.state,
                c.zip_code,
                c.country,
                c.advance_payment,
            ],
        )
        .map_err(|e| e.to_string())?;
    }

    // Insert products
    for p in &data.products {
        tx.execute(
            "INSERT INTO products (id, name, description, price, sku, category)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![p.id, p.name, p.description, p.price, p.sku, p.category],
        )
        .map_err(|e| e.to_string())?;
    }

    // Insert invoices and invoice_items
    for inv in &data.invoices {
        tx.execute(
            "INSERT INTO invoices (id, invoiceNumber, clientId, clientName, issueDate, dueDate, subtotal, taxRate, taxAmount, discountRate, discountAmount, total, status, notes, emailSent, lastReminderSent)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
            params![
                inv.id,
                inv.invoice_number,
                inv.client_id,
                inv.client_name,
                inv.issue_date,
                inv.due_date,
                inv.subtotal,
                inv.tax_rate,
                inv.tax_amount,
                inv.discount_rate,
                inv.discount_amount,
                inv.total,
                inv.status.as_str(),
                inv.notes,
                inv.email_sent.map(|v| if v { 1 } else { 0 }),
                inv.last_reminder_sent,
            ],
        )
        .map_err(|e| e.to_string())?;

        for item in &inv.items {
            let item_id = Uuid::new_v4().to_string();
            tx.execute(
                "INSERT INTO invoice_items (id, invoiceId, productId, productName, description, quantity, unitPrice, total)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    item_id,
                    inv.id,
                    item.product_id,
                    item.product_name,
                    item.description,
                    item.quantity,
                    item.unit_price,
                    item.total,
                ],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    // Insert settings
    let smtp_str = serde_json::to_string(&data.settings.smtp).map_err(|e| e.to_string())?;
    let templates_str =
        serde_json::to_string(&data.settings.email_templates).map_err(|e| e.to_string())?;
    tx.execute(
        "INSERT INTO app_settings (id, smtp, emailTemplates) VALUES (?1, ?2, ?3)",
        params!["default", smtp_str, templates_str],
    )
    .map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn clear_all_data(db: State<DbState>) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM invoice_items", [])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM invoices", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM clients", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM products", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM company", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM app_settings", [])
        .map_err(|e| e.to_string())?;

    Ok(())
}
