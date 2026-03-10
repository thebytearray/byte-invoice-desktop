use crate::db::DbState;
use crate::models::{Invoice, InvoiceItem, InvoiceStatus};
use serde::Deserialize;
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InvoiceUpdates {
    pub invoice_number: Option<String>,
    pub client_id: Option<String>,
    pub client_name: Option<String>,
    pub issue_date: Option<String>,
    pub due_date: Option<String>,
    pub items: Option<Vec<InvoiceItem>>,
    pub subtotal: Option<f64>,
    pub tax_rate: Option<f64>,
    pub tax_amount: Option<f64>,
    pub discount_rate: Option<f64>,
    pub discount_amount: Option<f64>,
    pub total: Option<f64>,
    pub status: Option<InvoiceStatus>,
    pub notes: Option<String>,
    pub email_sent: Option<bool>,
    pub last_reminder_sent: Option<String>,
}

pub fn get_invoices_impl(conn: &rusqlite::Connection) -> Result<Vec<Invoice>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, invoiceNumber, clientId, clientName, issueDate, dueDate, subtotal, taxRate, taxAmount,
             discountRate, discountAmount, total, status, notes, emailSent, lastReminderSent
             FROM invoices ORDER BY issueDate DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, f64>(6)?,
                row.get::<_, f64>(7)?,
                row.get::<_, f64>(8)?,
                row.get::<_, f64>(9)?,
                row.get::<_, f64>(10)?,
                row.get::<_, f64>(11)?,
                row.get::<_, String>(12)?,
                row.get::<_, Option<String>>(13).ok().flatten(),
                row.get::<_, Option<i32>>(14).ok().flatten().map(|v| v != 0),
                row.get::<_, Option<String>>(15).ok().flatten(),
            ))
        })
        .map_err(|e| e.to_string())?;

    let mut invoices = Vec::new();
    for row in rows {
        let (
            id,
            inv_num,
            client_id,
            client_name,
            issue_date,
            due_date,
            subtotal,
            tax_rate,
            tax_amount,
            discount_rate,
            discount_amount,
            total,
            status,
            notes,
            email_sent,
            last_reminder,
        ) = row.map_err(|e| e.to_string())?;

        let mut item_stmt = conn
            .prepare("SELECT productId, productName, description, quantity, unitPrice, total FROM invoice_items WHERE invoiceId = ?1")
            .map_err(|e| e.to_string())?;
        let item_rows = item_stmt
            .query_map([&id], |row| {
                Ok(InvoiceItem {
                    product_id: row.get(0)?,
                    product_name: row.get(1)?,
                    description: row.get(2)?,
                    quantity: row.get(3)?,
                    unit_price: row.get(4)?,
                    total: row.get(5)?,
                })
            })
            .map_err(|e| e.to_string())?;
        let items: Vec<InvoiceItem> = item_rows
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;

        invoices.push(Invoice {
            id,
            invoice_number: inv_num,
            client_id,
            client_name,
            issue_date,
            due_date,
            items,
            subtotal,
            tax_rate,
            tax_amount,
            discount_rate,
            discount_amount,
            total,
            status: InvoiceStatus::from_str(&status),
            notes,
            email_sent,
            last_reminder_sent: last_reminder,
        });
    }

    Ok(invoices)
}

#[tauri::command]
pub fn get_invoices(db: State<DbState>) -> Result<Vec<Invoice>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    get_invoices_impl(&conn)
}

#[tauri::command]
pub fn add_invoice(db: State<DbState>, invoice: Invoice) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO invoices (id, invoiceNumber, clientId, clientName, issueDate, dueDate, subtotal, taxRate, taxAmount, discountRate, discountAmount, total, status, notes, emailSent, lastReminderSent)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
        rusqlite::params![
            invoice.id,
            invoice.invoice_number,
            invoice.client_id,
            invoice.client_name,
            invoice.issue_date,
            invoice.due_date,
            invoice.subtotal,
            invoice.tax_rate,
            invoice.tax_amount,
            invoice.discount_rate,
            invoice.discount_amount,
            invoice.total,
            invoice.status.as_str(),
            invoice.notes,
            invoice.email_sent.map(|v| if v { 1 } else { 0 }),
            invoice.last_reminder_sent,
        ],
    )
    .map_err(|e| e.to_string())?;

    for item in &invoice.items {
        let item_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO invoice_items (id, invoiceId, productId, productName, description, quantity, unitPrice, total)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            rusqlite::params![
                item_id,
                invoice.id,
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

    Ok(())
}

#[tauri::command]
pub fn update_invoice(
    db: State<DbState>,
    id: String,
    updates: InvoiceUpdates,
) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    if let Some(items) = &updates.items {
        conn.execute("DELETE FROM invoice_items WHERE invoiceId = ?1", [&id])
            .map_err(|e| e.to_string())?;

        for item in items {
            let item_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO invoice_items (id, invoiceId, productId, productName, description, quantity, unitPrice, total)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                rusqlite::params![
                    item_id,
                    id,
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

    if let Some(v) = &updates.invoice_number {
        conn.execute(
            "UPDATE invoices SET invoiceNumber = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.client_id {
        conn.execute(
            "UPDATE invoices SET clientId = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.client_name {
        conn.execute(
            "UPDATE invoices SET clientName = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.issue_date {
        conn.execute(
            "UPDATE invoices SET issueDate = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.due_date {
        conn.execute(
            "UPDATE invoices SET dueDate = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = updates.subtotal {
        conn.execute(
            "UPDATE invoices SET subtotal = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = updates.tax_rate {
        conn.execute(
            "UPDATE invoices SET taxRate = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = updates.tax_amount {
        conn.execute(
            "UPDATE invoices SET taxAmount = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = updates.discount_rate {
        conn.execute(
            "UPDATE invoices SET discountRate = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = updates.discount_amount {
        conn.execute(
            "UPDATE invoices SET discountAmount = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = updates.total {
        conn.execute(
            "UPDATE invoices SET total = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.status {
        conn.execute(
            "UPDATE invoices SET status = ?1 WHERE id = ?2",
            rusqlite::params![v.as_str(), id],
        )
        .map_err(|e| e.to_string())?;
    }
    if updates.notes.is_some() {
        conn.execute(
            "UPDATE invoices SET notes = ?1 WHERE id = ?2",
            rusqlite::params![updates.notes, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = updates.email_sent {
        conn.execute(
            "UPDATE invoices SET emailSent = ?1 WHERE id = ?2",
            rusqlite::params![if v { 1 } else { 0 }, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if updates.last_reminder_sent.is_some() {
        conn.execute(
            "UPDATE invoices SET lastReminderSent = ?1 WHERE id = ?2",
            rusqlite::params![updates.last_reminder_sent, id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn delete_invoice(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM invoices WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_invoice_count(db: State<DbState>) -> Result<u32, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM invoices", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    Ok(count as u32)
}
