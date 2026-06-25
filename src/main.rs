mod config;
mod models;
mod crypto;
mod code_gen;
mod db;

use actix_web::{middleware, web, App, HttpResponse, HttpServer, Result as ActixResult};
use config::CONFIG;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = CONFIG.clone();
    let bind_addr = format!("0.0.0.0:{}", config.server_port);

    log::info!("Starting Confort backend on {}", bind_addr);

    HttpServer::new(move || {
        let allowed_origins = config.cors_origins.clone();

        let cors = if allowed_origins.contains(&"*".to_string()) {
            actix_web::middleware::DefaultHeaders::new()
                .add(("Access-Control-Allow-Origin", "*"))
        } else {
            let origins_str = allowed_origins.join(", ");
            actix_web::middleware::DefaultHeaders::new()
                .add(("Access-Control-Allow-Origin", origins_str.as_str()))
        };

        App::new()
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .wrap(
                actix_web::middleware::DefaultHeaders::new()
                    .add(("Content-Type", "application/json"))
                    .add(("Access-Control-Allow-Methods", "GET, POST, OPTIONS"))
                    .add(("Access-Control-Allow-Headers", "Content-Type, Authorization"))
            )
            .route("/health", web::get().to(health_check))
    })
    .bind(&bind_addr)?
    .run()
    .await
}

async fn health_check() -> ActixResult<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "confort"
    })))
}
