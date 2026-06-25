use confort::crypto::verify_binance_signature;
use confort::code_gen::generate_code;
use serde_json::json;
use std::collections::HashSet;

#[test]
fn test_generate_code_produces_4_chars() {
    for _ in 0..100 {
        let code = generate_code();
        assert_eq!(code.len(), 4, "Code '{}' should be 4 characters", code);
    }
}

#[test]
fn test_generate_code_excludes_forbidden_chars() {
    for _ in 0..1000 {
        let code = generate_code();
        assert!(!code.contains('O'), "Code '{}' contains O", code);
        assert!(!code.contains('o'), "Code '{}' contains o", code);
        assert!(!code.contains('I'), "Code '{}' contains I", code);
        assert!(!code.contains('i'), "Code '{}' contains i", code);
        assert!(!code.contains('0'), "Code '{}' contains 0", code);
        assert!(!code.contains('1'), "Code '{}' contains 1", code);
    }
}

#[test]
fn test_generate_code_variation() {
    let mut codes = HashSet::new();
    for _ in 0..100 {
        codes.insert(generate_code());
    }

    let unique_count = codes.len();
    assert!(
        unique_count >= 50,
        "Expected at least 50 unique codes in 100 calls, got {}",
        unique_count
    );
}

#[test]
fn test_verify_binance_signature_valid() {
    let api_key = "test_key_binance";
    let mut payload = json!({
        "amount": "500",
        "currency": "USDT",
        "transaction_id": "BINANCE_TXN_123"
    });

    let msg = "500USDTBINANCE_TXN_123".to_string() + api_key;
    let signature = compute_sha256_hex(&msg);

    let obj = payload.as_object_mut().unwrap();
    obj.insert("signature".to_string(), serde_json::Value::String(signature));

    assert!(verify_binance_signature(&payload, api_key));
}

#[test]
fn test_verify_binance_signature_invalid() {
    let payload = json!({
        "transaction_id": "TXN123",
        "amount": "500",
        "signature": "wrong_signature"
    });

    assert!(!verify_binance_signature(&payload, "test_key_binance"));
}

#[test]
fn test_verify_binance_signature_missing_key() {
    let payload = json!({
        "transaction_id": "TXN123",
        "signature": "some_sig"
    });

    assert!(!verify_binance_signature(&payload, ""));
}

#[test]
fn test_signature_case_sensitive() {
    let api_key = "api_key";
    let mut payload1 = json!({
        "transaction_id": "txn001",
        "amount": "1000"
    });
    let mut payload2 = json!({
        "transaction_id": "TXN001",
        "amount": "1000"
    });

    let msg1 = "1000txn001".to_string() + api_key;
    let msg2 = "1000TXN001".to_string() + api_key;
    let sig1 = compute_sha256_hex(&msg1);
    let sig2 = compute_sha256_hex(&msg2);

    let obj1 = payload1.as_object_mut().unwrap();
    let obj2 = payload2.as_object_mut().unwrap();
    obj1.insert("signature".to_string(), serde_json::Value::String(sig1.clone()));
    obj2.insert("signature".to_string(), serde_json::Value::String(sig2.clone()));

    assert!(verify_binance_signature(&payload1, api_key));
    assert!(verify_binance_signature(&payload2, api_key));
    assert_ne!(sig1, sig2, "Different inputs should produce different signatures");
}

#[test]
fn test_code_generation_is_random() {
    let codes: Vec<String> = (0..20).map(|_| generate_code()).collect();
    let unique_count = codes.iter().collect::<HashSet<_>>().len();

    assert!(
        unique_count >= 10,
        "Expected at least 10 unique codes in 20 calls, got {}",
        unique_count
    );
}

fn compute_sha256_hex(input: &str) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    hex::encode(result)
}

#[test]
fn test_code_gen_valid_char_set() {
    let valid_chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789";
    for _ in 0..100 {
        let code = generate_code();
        for c in code.chars() {
            assert!(
                valid_chars.contains(c),
                "Code {} contains invalid character: {}",
                code,
                c
            );
        }
    }
}
