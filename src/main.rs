mod config;
mod models;
mod crypto;
mod code_gen;
mod db;
mod handlers;

use actix_web::{middleware, web, App, HttpResponse, HttpServer, Result as ActixResult};
use config::CONFIG;
use db::SupabaseClient;
use handlers::AppState;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = CONFIG.clone();
    let bind_addr = format!("0.0.0.0:{}", config.server_port);

    log::info!("Starting Confort backend on {}", bind_addr);
    log::info!("Supabase URL: {}", config.supabase_url);

    let db = SupabaseClient::new(config.supabase_url.clone(), config.supabase_service_key.clone());
    let app_state = web::Data::new(AppState { db });

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
            .app_data(app_state.clone())
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .wrap(
                actix_web::middleware::DefaultHeaders::new()
                    .add(("Content-Type", "application/json"))
                    .add(("Access-Control-Allow-Methods", "GET, POST, OPTIONS"))
                    .add(("Access-Control-Allow-Headers", "Content-Type, Authorization"))
            )
            .route("/health", web::get().to(health_check))
            .route("/api/initiate", web::post().to(handlers::initiate_payment))
            .route("/api/transaction/{transaction_id}", web::get().to(handlers::get_transaction))
            .route("/api/verify-code", web::post().to(handlers::verify_code))
            .route("/api/webhook/cinetpay", web::post().to(handlers::webhook_cinetpay))
            .route("/api/webhook/crypto", web::post().to(handlers::webhook_crypto))
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
