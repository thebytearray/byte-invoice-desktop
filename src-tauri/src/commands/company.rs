use crate::db::DbState;
use crate::models::Company;
use tauri::State;

const COMPANY_ID: &str = "default";

pub fn default_company() -> Company {
    Company {
        name: String::new(),
        address: String::new(),
        city: String::new(),
        state: String::new(),
        zip_code: None,
        country: String::new(),
        phone: None,
        email: String::new(),
        website: None,
        tax_id: None,
        logo: None,
    }
}

pub fn get_company_impl(conn: &rusqlite::Connection) -> Result<Option<Company>, String> {
    let mut stmt = conn
        .prepare("SELECT name, address, city, state, zipCode, country, phone, email, website, taxId, logo FROM company WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([COMPANY_ID]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        Ok(Some(Company {
            name: row.get(0).unwrap_or_default(),
            address: row.get(1).unwrap_or_default(),
            city: row.get(2).unwrap_or_default(),
            state: row.get(3).unwrap_or_default(),
            zip_code: row.get(4).ok().flatten(),
            country: row.get(5).unwrap_or_default(),
            phone: row.get(6).ok().flatten(),
            email: row.get(7).unwrap_or_default(),
            website: row.get(8).ok().flatten(),
            tax_id: row.get(9).ok().flatten(),
            logo: row.get(10).ok().flatten(),
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn get_company(db: State<DbState>) -> Result<Option<Company>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    get_company_impl(&conn)
}

#[tauri::command]
pub fn set_company(db: State<DbState>, company: Company) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO company (id, name, address, city, state, zipCode, country, phone, email, website, taxId, logo)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
         ON CONFLICT(id) DO UPDATE SET
         name = excluded.name, address = excluded.address, city = excluded.city, state = excluded.state,
         zipCode = excluded.zipCode, country = excluded.country, phone = excluded.phone, email = excluded.email,
         website = excluded.website, taxId = excluded.taxId, logo = excluded.logo",
        rusqlite::params![
            COMPANY_ID,
            company.name,
            company.address,
            company.city,
            company.state,
            company.zip_code,
            company.country,
            company.phone,
            company.email,
            company.website,
            company.tax_id,
            company.logo,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
