mod migrations;

use rusqlite::Connection;
use std::path::Path;
use std::sync::{Arc, Mutex};

pub type DbState = Arc<Mutex<Connection>>;

pub fn init(db_path: &Path) -> rusqlite::Result<DbState> {
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| {
            rusqlite::Error::ToSqlConversionFailure(Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to create app data dir: {}", e),
            )))
        })?;
    }

    let conn = Connection::open(db_path)?;
    conn.execute_batch(migrations::INIT_SQL)?;
    Ok(Arc::new(Mutex::new(conn)))
}
