use crate::db::DbState;
use crate::models::Client;
use serde::Deserialize;
use tauri::State;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientUpdates {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub zip_code: Option<String>,
    pub country: Option<String>,
    pub advance_payment: Option<f64>,
}

pub fn get_clients_impl(conn: &rusqlite::Connection) -> Result<Vec<Client>, String> {
    let mut stmt = conn
        .prepare("SELECT id, name, email, phone, address, city, state, zipCode, country, advancePayment FROM clients ORDER BY name")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(Client {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                phone: row.get(3).ok().flatten(),
                address: row.get(4)?,
                city: row.get(5)?,
                state: row.get(6)?,
                zip_code: row.get(7).ok().flatten(),
                country: row.get(8)?,
                advance_payment: row.get(9).ok().flatten(),
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_clients(db: State<DbState>) -> Result<Vec<Client>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    get_clients_impl(&conn)
}

#[tauri::command]
pub fn add_client(db: State<DbState>, client: Client) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO clients (id, name, email, phone, address, city, state, zipCode, country, advancePayment)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            client.id,
            client.name,
            client.email,
            client.phone,
            client.address,
            client.city,
            client.state,
            client.zip_code,
            client.country,
            client.advance_payment,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_client(
    db: State<DbState>,
    id: String,
    updates: ClientUpdates,
) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    if let Some(v) = &updates.name {
        conn.execute("UPDATE clients SET name = ?1 WHERE id = ?2", rusqlite::params![v, id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.email {
        conn.execute("UPDATE clients SET email = ?1 WHERE id = ?2", rusqlite::params![v, id])
            .map_err(|e| e.to_string())?;
    }
    if updates.phone.is_some() {
        conn.execute("UPDATE clients SET phone = ?1 WHERE id = ?2", rusqlite::params![updates.phone, id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.address {
        conn.execute("UPDATE clients SET address = ?1 WHERE id = ?2", rusqlite::params![v, id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.city {
        conn.execute("UPDATE clients SET city = ?1 WHERE id = ?2", rusqlite::params![v, id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.state {
        conn.execute("UPDATE clients SET state = ?1 WHERE id = ?2", rusqlite::params![v, id])
            .map_err(|e| e.to_string())?;
    }
    if updates.zip_code.is_some() {
        conn.execute("UPDATE clients SET zipCode = ?1 WHERE id = ?2", rusqlite::params![updates.zip_code, id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.country {
        conn.execute("UPDATE clients SET country = ?1 WHERE id = ?2", rusqlite::params![v, id])
            .map_err(|e| e.to_string())?;
    }
    if updates.advance_payment.is_some() {
        conn.execute("UPDATE clients SET advancePayment = ?1 WHERE id = ?2", rusqlite::params![updates.advance_payment, id])
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn delete_client(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM clients WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
