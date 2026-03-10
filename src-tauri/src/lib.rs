mod commands;
mod db;
mod models;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let db_path = app
                .path()
                .app_data_dir()
                .map_err(|e| e.to_string())?
                .join("byte_invoice.db");
            let db = db::init(&db_path).map_err(|e| e.to_string())?;
            app.manage(db);

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::company::get_company,
            commands::company::set_company,
            commands::clients::get_clients,
            commands::clients::add_client,
            commands::clients::update_client,
            commands::clients::delete_client,
            commands::products::get_products,
            commands::products::add_product,
            commands::products::update_product,
            commands::products::delete_product,
            commands::invoices::get_invoices,
            commands::invoices::add_invoice,
            commands::invoices::update_invoice,
            commands::invoices::delete_invoice,
            commands::invoices::get_invoice_count,
            commands::settings::get_settings,
            commands::settings::set_settings,
            commands::data::initialize_data,
            commands::data_io::export_data,
            commands::data_io::import_data,
            commands::data_io::clear_all_data,
            commands::email::send_email,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
