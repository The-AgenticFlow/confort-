use once_cell::sync::Lazy;
use std::env;

pub static CONFIG: Lazy<Config> = Lazy::new(|| Config::from_env());

#[derive(Clone, Debug)]
pub struct Config {
    pub supabase_url: String,
    pub supabase_service_key: String,
    pub cinetpay_api_key: String,
    pub binance_api_key: String,
    pub cors_origins: Vec<String>,
    pub server_port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        dotenv::dotenv().ok();

        let supabase_url = env::var("SUPABASE_URL")
            .expect("SUPABASE_URL must be set");
        let supabase_service_key = env::var("SUPABASE_SERVICE_KEY")
            .expect("SUPABASE_SERVICE_KEY must be set");
        let cinetpay_api_key = env::var("CINETPAY_API_KEY")
            .unwrap_or_default();
        let binance_api_key = env::var("BINANCE_API_KEY")
            .unwrap_or_default();

        let cors_origin = env::var("CORS_ORIGIN")
            .unwrap_or_else(|_| "*".to_string());
        let cors_origins: Vec<String> = cors_origin
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();

        let server_port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "8000".to_string())
            .parse()
            .unwrap_or(8000);

        Config {
            supabase_url,
            supabase_service_key,
            cinetpay_api_key,
            binance_api_key,
            cors_origins,
            server_port,
        }
    }
}
