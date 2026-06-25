use reqwest::Client;
use serde_json::Value;
use std::collections::HashMap;

const FAPSHI_BASE_URL: &str = "https://api.fapshi.com";

#[derive(Clone)]
pub struct FapshiClient {
    http_client: Client,
    api_user: String,
    api_key: String,
    webhook_secret: String,
}

impl FapshiClient {
    pub fn new(api_user: String, api_key: String, webhook_secret: String) -> Self {
        FapshiClient {
            http_client: Client::new(),
            api_user,
            api_key,
            webhook_secret,
        }
    }

    pub async fn initiate_payment(
        &self,
        amount: u32,
        external_id: &str,
    ) -> Result<InitiatePaymentResponse, String> {
        let url = format!("{}/v1/initiate-pay", FAPSHI_BASE_URL);

        let mut payload = HashMap::new();
        payload.insert("amount", amount.to_string());
        payload.insert("externalId", external_id.to_string());
        payload.insert("userId", external_id.to_string());

        let response = self
            .http_client
            .post(&url)
            .header("apiuser", &self.api_user)
            .header("apikey", &self.api_key)
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Fapshi API error: {}", response.status()));
        }

        let body = response
            .json::<Value>()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(InitiatePaymentResponse {
            trans_id: body
                .get("transId")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            link: body
                .get("link")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
        })
    }

    pub async fn get_transaction_status(&self, user_id: &str) -> Result<Value, String> {
        let url = format!("{}/v1/transaction/{}", FAPSHI_BASE_URL, user_id);

        let response = self
            .http_client
            .get(&url)
            .header("apiuser", &self.api_user)
            .header("apikey", &self.api_key)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Fapshi API error: {}", response.status()));
        }

        response
            .json::<Value>()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))
    }

    pub fn verify_webhook_signature(&self, received_secret: &str) -> bool {
        constant_time_compare(received_secret.as_bytes(), self.webhook_secret.as_bytes())
    }
}

fn constant_time_compare(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }

    let mut result = 0u8;
    for i in 0..a.len() {
        result |= a[i] ^ b[i];
    }

    result == 0
}

#[derive(Debug, Clone)]
pub struct InitiatePaymentResponse {
    pub trans_id: String,
    pub link: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constant_time_compare_equal() {
        assert!(constant_time_compare(b"secret123", b"secret123"));
    }

    #[test]
    fn test_constant_time_compare_not_equal() {
        assert!(!constant_time_compare(b"secret123", b"secret124"));
    }

    #[test]
    fn test_constant_time_compare_different_length() {
        assert!(!constant_time_compare(b"secret", b"secret123"));
    }

    #[test]
    fn test_webhook_signature_verification() {
        let fapshi = FapshiClient::new(
            "test_user".to_string(),
            "test_key".to_string(),
            "webhook_secret_123".to_string(),
        );

        assert!(fapshi.verify_webhook_signature("webhook_secret_123"));
        assert!(!fapshi.verify_webhook_signature("wrong_secret"));
        assert!(!fapshi.verify_webhook_signature(""));
    }
}
