use crate::db::{SupabaseClient, DbError};
use crate::models::{InitiateRequest, InitiateResponse, TransactionResponse, VerifyCodeRequest, VerifyCodeResponse, ProcessPaymentResponse};
use crate::crypto::verify_binance_signature;
use crate::fapshi::FapshiClient;
use crate::code_gen::generate_code;
use actix_web::{web, HttpResponse, HttpRequest, Result as ActixResult};
use serde_json::Value;

#[derive(Clone)]
pub struct AppState {
    pub db: SupabaseClient,
    pub fapshi: FapshiClient,
}

pub async fn initiate_payment(
    req: web::Json<InitiateRequest>,
    state: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    match state.db.insert_transaction(req.time_slot, req.amount, "MOMO", "PENDING").await {
        Ok(transaction) => {
            Ok(HttpResponse::Created().json(InitiateResponse {
                id: transaction.id,
            }))
        }
        Err(DbError::BadRequest(msg)) => {
            Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "detail": msg
            })))
        }
        Err(_) => {
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "detail": "Failed to create transaction"
            })))
        }
    }
}

pub async fn get_transaction(
    path: web::Path<String>,
    state: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    let transaction_id = path.into_inner();

    match state.db.get_transaction(&transaction_id).await {
        Ok(transaction) => {
            Ok(HttpResponse::Ok().json(TransactionResponse {
                id: transaction.id,
                status: transaction.status,
                code: transaction.code,
                time_slot: transaction.time_slot,
                amount: transaction.amount,
            }))
        }
        Err(DbError::NotFound) => {
            Ok(HttpResponse::NotFound().json(serde_json::json!({
                "detail": "Transaction not found"
            })))
        }
        Err(_) => {
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "detail": "Server error"
            })))
        }
    }
}

pub async fn verify_code(
    req: web::Json<VerifyCodeRequest>,
    state: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    match state.db.find_transaction_by_code(&req.code).await {
        Ok(transaction) => {
            if transaction.status == "USED" {
                return Ok(HttpResponse::Ok().json(VerifyCodeResponse {
                    success: false,
                    message: Some("Code already used".to_string()),
                }));
            }

            if transaction.status == "PAID" {
                if let Err(_) = state.db.update_transaction_status(&transaction.id, "USED").await {
                    return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                        "detail": "Failed to update transaction"
                    })));
                }

                return Ok(HttpResponse::Ok().json(VerifyCodeResponse {
                    success: true,
                    message: None,
                }));
            }

            Ok(HttpResponse::Ok().json(VerifyCodeResponse {
                success: false,
                message: Some("Invalid code status".to_string()),
            }))
        }
        Err(DbError::NotFound) => {
            Ok(HttpResponse::Ok().json(VerifyCodeResponse {
                success: false,
                message: Some("Invalid code".to_string()),
            }))
        }
        Err(_) => {
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "detail": "Server error"
            })))
        }
    }
}

pub async fn process_payment(
    payload: &Value,
    transaction_id_key: &str,
    db: &SupabaseClient,
) -> Result<ProcessPaymentResponse, HttpResponse> {
    let trans_id = match payload.get(transaction_id_key) {
        Some(Value::String(id)) => id.clone(),
        _ => {
            return Err(HttpResponse::BadRequest().json(serde_json::json!({
                "detail": "Missing transaction ID"
            })))
        }
    };

    let transaction = match db.get_transaction(&trans_id).await {
        Ok(t) => t,
        Err(DbError::NotFound) => {
            return Err(HttpResponse::NotFound().json(serde_json::json!({
                "detail": "Transaction not found"
            })))
        }
        Err(_) => {
            return Err(HttpResponse::InternalServerError().json(serde_json::json!({
                "detail": "Server error"
            })))
        }
    };

    if transaction.status != "PENDING" {
        return Ok(ProcessPaymentResponse {
            status: "ok".to_string(),
        });
    }

    let max_attempts = 10;
    for _ in 0..max_attempts {
        let code = generate_code();
        match db.find_transaction_by_code(&code).await {
            Err(DbError::NotFound) => {
                match db.update_transaction_with_code(&trans_id, &code, "PAID").await {
                    Ok(_) => {
                        return Ok(ProcessPaymentResponse {
                            status: "ok".to_string(),
                        });
                    }
                    Err(_) => {
                        return Err(HttpResponse::InternalServerError().json(serde_json::json!({
                            "detail": "Failed to update transaction"
                        })))
                    }
                }
            }
            Ok(_) => continue,
            Err(_) => {
                return Err(HttpResponse::InternalServerError().json(serde_json::json!({
                    "detail": "Database error"
                })))
            }
        }
    }

    Err(HttpResponse::InternalServerError().json(serde_json::json!({
        "detail": "Failed to generate unique code"
    })))
}

pub async fn webhook_fapshi(
    req: HttpRequest,
    payload: web::Json<Value>,
    state: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    let received_secret = req
        .headers()
        .get("x-wh-secret")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    if !state.fapshi.verify_webhook_signature(received_secret) {
        return Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "detail": "Invalid webhook signature"
        })));
    }

    match process_payment(&payload, "externalId", &state.db).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(response) => Ok(response),
    }
}

pub async fn webhook_crypto(
    _req: HttpRequest,
    payload: web::Json<Value>,
    state: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    if !verify_binance_signature(&payload, &state.db.service_key) {
        return Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "detail": "Invalid signature"
        })));
    }

    match process_payment(&payload, "transaction_id", &state.db).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(response) => Ok(response),
    }
}
