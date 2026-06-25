use crate::models::TransactionData;
use reqwest::{Client, StatusCode};
use serde_json::{json, Value};
use std::fmt;

#[derive(Debug, Clone)]
pub enum DbError {
    NotFound,
    BadRequest(String),
    ServerError(String),
    NetworkError(String),
}

impl fmt::Display for DbError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            DbError::NotFound => write!(f, "Resource not found"),
            DbError::BadRequest(msg) => write!(f, "Bad request: {}", msg),
            DbError::ServerError(msg) => write!(f, "Server error: {}", msg),
            DbError::NetworkError(msg) => write!(f, "Network error: {}", msg),
        }
    }
}

impl std::error::Error for DbError {}

#[derive(Clone)]
pub struct SupabaseClient {
    http_client: Client,
    pub base_url: String,
    pub service_key: String,
}

impl SupabaseClient {
    pub fn new(base_url: String, service_key: String) -> Self {
        SupabaseClient {
            http_client: Client::new(),
            base_url,
            service_key,
        }
    }

    fn build_headers(&self) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        if let Ok(apikey) = self.service_key.parse() {
            headers.insert("apikey", apikey);
        }
        if let Ok(auth) = format!("Bearer {}", self.service_key).parse() {
            headers.insert("Authorization", auth);
        }
        if let Ok(content_type) = "application/json".parse() {
            headers.insert("Content-Type", content_type);
        }
        headers
    }

    pub async fn insert_transaction(
        &self,
        time_slot: u32,
        amount: u32,
        payment_method: &str,
        status: &str,
    ) -> Result<TransactionData, DbError> {
        let url = format!("{}/rest/v1/transactions", self.base_url);
        let body = json!({
            "time_slot": time_slot,
            "amount": amount,
            "payment_method": payment_method,
            "status": status
        });

        let response = self
            .http_client
            .post(&url)
            .headers(self.build_headers())
            .json(&body)
            .send()
            .await
            .map_err(|e| DbError::NetworkError(e.to_string()))?;

        match response.status() {
            StatusCode::CREATED => {
                let data: Vec<TransactionData> = response
                    .json()
                    .await
                    .map_err(|e| DbError::ServerError(e.to_string()))?;

                data.first()
                    .cloned()
                    .ok_or_else(|| DbError::ServerError("Empty response".to_string()))
            }
            StatusCode::BAD_REQUEST => {
                let error: Value = response.json().await.unwrap_or(json!({}));
                Err(DbError::BadRequest(error.to_string()))
            }
            _ => {
                let error: Value = response.json().await.unwrap_or(json!({}));
                Err(DbError::ServerError(error.to_string()))
            }
        }
    }

    pub async fn get_transaction(&self, id: &str) -> Result<TransactionData, DbError> {
        let url = format!("{}/rest/v1/transactions?id=eq.{}", self.base_url, id);

        let response = self
            .http_client
            .get(&url)
            .headers(self.build_headers())
            .send()
            .await
            .map_err(|e| DbError::NetworkError(e.to_string()))?;

        match response.status() {
            StatusCode::OK => {
                let data: Vec<TransactionData> = response
                    .json()
                    .await
                    .map_err(|e| DbError::ServerError(e.to_string()))?;

                data.first()
                    .cloned()
                    .ok_or(DbError::NotFound)
            }
            StatusCode::NOT_FOUND => Err(DbError::NotFound),
            _ => {
                let error: Value = response.json().await.unwrap_or(json!({}));
                Err(DbError::ServerError(error.to_string()))
            }
        }
    }

    pub async fn find_transaction_by_code(&self, code: &str) -> Result<TransactionData, DbError> {
        let url = format!("{}/rest/v1/transactions?code=eq.{}", self.base_url, code);

        let response = self
            .http_client
            .get(&url)
            .headers(self.build_headers())
            .send()
            .await
            .map_err(|e| DbError::NetworkError(e.to_string()))?;

        match response.status() {
            StatusCode::OK => {
                let data: Vec<TransactionData> = response
                    .json()
                    .await
                    .map_err(|e| DbError::ServerError(e.to_string()))?;

                data.first()
                    .cloned()
                    .ok_or(DbError::NotFound)
            }
            StatusCode::NOT_FOUND => Err(DbError::NotFound),
            _ => {
                let error: Value = response.json().await.unwrap_or(json!({}));
                Err(DbError::ServerError(error.to_string()))
            }
        }
    }

    pub async fn update_transaction_status(
        &self,
        id: &str,
        status: &str,
    ) -> Result<(), DbError> {
        let url = format!("{}/rest/v1/transactions?id=eq.{}", self.base_url, id);
        let body = json!({
            "status": status
        });

        let response = self
            .http_client
            .patch(&url)
            .headers(self.build_headers())
            .json(&body)
            .send()
            .await
            .map_err(|e| DbError::NetworkError(e.to_string()))?;

        match response.status() {
            StatusCode::OK | StatusCode::NO_CONTENT => Ok(()),
            StatusCode::NOT_FOUND => Err(DbError::NotFound),
            StatusCode::BAD_REQUEST => {
                let error: Value = response.json().await.unwrap_or(json!({}));
                Err(DbError::BadRequest(error.to_string()))
            }
            _ => {
                let error: Value = response.json().await.unwrap_or(json!({}));
                Err(DbError::ServerError(error.to_string()))
            }
        }
    }

    pub async fn update_transaction_with_code(
        &self,
        id: &str,
        code: &str,
        status: &str,
    ) -> Result<(), DbError> {
        let url = format!("{}/rest/v1/transactions?id=eq.{}", self.base_url, id);
        let body = json!({
            "status": status,
            "code": code
        });

        let response = self
            .http_client
            .patch(&url)
            .headers(self.build_headers())
            .json(&body)
            .send()
            .await
            .map_err(|e| DbError::NetworkError(e.to_string()))?;

        match response.status() {
            StatusCode::OK | StatusCode::NO_CONTENT => Ok(()),
            StatusCode::NOT_FOUND => Err(DbError::NotFound),
            StatusCode::BAD_REQUEST => {
                let error: Value = response.json().await.unwrap_or(json!({}));
                Err(DbError::BadRequest(error.to_string()))
            }
            _ => {
                let error: Value = response.json().await.unwrap_or(json!({}));
                Err(DbError::ServerError(error.to_string()))
            }
        }
    }
}
