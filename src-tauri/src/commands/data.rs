use crate::commands::{clients, company, invoices, products, settings};
use crate::db::DbState;
use crate::models::InitializeDataResult;
use tauri::State;

#[tauri::command]
pub fn initialize_data(db: State<DbState>) -> Result<InitializeDataResult, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let company = company::get_company_impl(&conn)?.unwrap_or_else(company::default_company);
    let clients = clients::get_clients_impl(&conn)?;
    let products = products::get_products_impl(&conn)?;
    let invoices = invoices::get_invoices_impl(&conn)?;
    let settings = settings::get_settings_impl(&conn)?;

    Ok(InitializeDataResult {
        company,
        clients,
        products,
        invoices,
        settings,
    })
}
