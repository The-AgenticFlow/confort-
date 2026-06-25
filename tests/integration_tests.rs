#[test]
fn test_initiate_payment_request_structure() {
    use confort::models::InitiateRequest;

    let req = InitiateRequest {
        time_slot: 1,
        amount: 1000,
    };

    assert_eq!(req.time_slot, 1);
    assert_eq!(req.amount, 1000);
}

#[test]
fn test_verify_code_request_structure() {
    use confort::models::VerifyCodeRequest;

    let req = VerifyCodeRequest {
        code: "ABC1".to_string(),
    };

    assert_eq!(req.code, "ABC1");
}

#[test]
fn test_supabase_client_creation() {
    use confort::db::SupabaseClient;

    let db = SupabaseClient::new(
        "http://localhost:54321".to_string(),
        "test_key".to_string(),
    );

    assert_eq!(db.base_url, "http://localhost:54321");
    assert_eq!(db.service_key, "test_key");
}

#[test]
fn test_app_state_creation() {
    use confort::db::SupabaseClient;
    use confort::handlers::AppState;

    let db = SupabaseClient::new(
        "http://localhost:54321".to_string(),
        "test_key".to_string(),
    );

    let state = AppState { db };
    assert_eq!(state.db.base_url, "http://localhost:54321");
}

#[test]
fn test_transaction_data_serialization() {
    use confort::models::TransactionData;

    let tx = TransactionData {
        id: "123".to_string(),
        status: "PENDING".to_string(),
        code: None,
        time_slot: 1,
        amount: 1000,
        payment_method: "MOMO".to_string(),
        created_at: Some("2026-06-25T10:00:00Z".to_string()),
        cinetpay_trans_id: None,
    };

    let json = serde_json::to_string(&tx).unwrap();
    assert!(json.contains("PENDING"));
    assert!(json.contains("1000"));
}

#[test]
fn test_transaction_response_fields() {
    use confort::models::TransactionResponse;

    let resp = TransactionResponse {
        id: "abc123".to_string(),
        status: "PAID".to_string(),
        code: Some("ABCD".to_string()),
        time_slot: 1,
        amount: 500,
    };

    assert_eq!(resp.id, "abc123");
    assert_eq!(resp.status, "PAID");
    assert_eq!(resp.code, Some("ABCD".to_string()));
    assert_eq!(resp.time_slot, 1);
    assert_eq!(resp.amount, 500);
}

#[test]
fn test_initiate_response_serialization() {
    use confort::models::InitiateResponse;

    let resp = InitiateResponse {
        id: "txn-uuid-123".to_string(),
    };

    let json = serde_json::to_string(&resp).unwrap();
    assert!(json.contains("txn-uuid-123"));
}

#[test]
fn test_verify_code_response_success() {
    use confort::models::VerifyCodeResponse;

    let resp = VerifyCodeResponse {
        success: true,
        message: None,
    };

    assert!(resp.success);
    assert_eq!(resp.message, None);
}

#[test]
fn test_verify_code_response_failure() {
    use confort::models::VerifyCodeResponse;

    let resp = VerifyCodeResponse {
        success: false,
        message: Some("Invalid code".to_string()),
    };

    assert!(!resp.success);
    assert_eq!(resp.message, Some("Invalid code".to_string()));
}

#[test]
fn test_process_payment_response() {
    use confort::models::ProcessPaymentResponse;

    let resp = ProcessPaymentResponse {
        status: "ok".to_string(),
    };

    assert_eq!(resp.status, "ok");
}

#[test]
fn test_db_error_display() {
    use confort::db::DbError;

    assert_eq!(DbError::NotFound.to_string(), "Resource not found");
    assert!(DbError::BadRequest("test".to_string()).to_string().contains("test"));
    assert!(DbError::ServerError("error".to_string()).to_string().contains("error"));
    assert!(DbError::NetworkError("net".to_string()).to_string().contains("net"));
}

#[test]
fn test_request_model_serialization() {
    use confort::models::InitiateRequest;

    let req = InitiateRequest {
        time_slot: 5,
        amount: 2500,
    };

    let json = serde_json::to_string(&req).unwrap();
    assert!(json.contains("\"time_slot\":5"));
    assert!(json.contains("\"amount\":2500"));
}

#[test]
fn test_api_models_json_roundtrip() {
    use confort::models::TransactionResponse;

    let original = TransactionResponse {
        id: "test-id".to_string(),
        status: "PAID".to_string(),
        code: Some("XYZW".to_string()),
        time_slot: 10,
        amount: 5000,
    };

    let json = serde_json::to_string(&original).unwrap();
    let deserialized: TransactionResponse = serde_json::from_str(&json).unwrap();

    assert_eq!(deserialized.id, original.id);
    assert_eq!(deserialized.status, original.status);
    assert_eq!(deserialized.code, original.code);
    assert_eq!(deserialized.time_slot, original.time_slot);
    assert_eq!(deserialized.amount, original.amount);
}
