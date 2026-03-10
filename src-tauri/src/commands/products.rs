use crate::db::DbState;
use crate::models::Product;
use serde::Deserialize;
use tauri::State;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductUpdates {
    pub name: Option<String>,
    pub description: Option<String>,
    pub price: Option<f64>,
    pub sku: Option<String>,
    pub category: Option<String>,
}

pub fn get_products_impl(conn: &rusqlite::Connection) -> Result<Vec<Product>, String> {
    let mut stmt = conn
        .prepare("SELECT id, name, description, price, sku, category FROM products ORDER BY name")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                price: row.get(3).ok().flatten(),
                sku: row.get(4)?,
                category: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_products(db: State<DbState>) -> Result<Vec<Product>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    get_products_impl(&conn)
}

#[tauri::command]
pub fn add_product(db: State<DbState>, product: Product) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO products (id, name, description, price, sku, category)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            product.id,
            product.name,
            product.description,
            product.price,
            product.sku,
            product.category,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_product(
    db: State<DbState>,
    id: String,
    updates: ProductUpdates,
) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    if let Some(v) = &updates.name {
        conn.execute(
            "UPDATE products SET name = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.description {
        conn.execute(
            "UPDATE products SET description = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if updates.price.is_some() {
        conn.execute(
            "UPDATE products SET price = ?1 WHERE id = ?2",
            rusqlite::params![updates.price, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.sku {
        conn.execute(
            "UPDATE products SET sku = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = &updates.category {
        conn.execute(
            "UPDATE products SET category = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn delete_product(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM products WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
