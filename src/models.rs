use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitiateRequest {
    pub time_slot: u32,
    pub amount: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitiateResponse {
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionResponse {
    pub id: String,
    pub status: String,
    pub code: Option<String>,
    pub time_slot: u32,
    pub amount: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyCodeRequest {
    pub code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyCodeResponse {
    pub success: bool,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessPaymentResponse {
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub struct TransactionData {
    pub id: String,
    pub status: String,
    pub code: Option<String>,
    pub time_slot: u32,
    pub amount: u32,
    pub payment_method: String,
    pub created_at: Option<String>,
    pub fapshi_trans_id: Option<String>,
}
