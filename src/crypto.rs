use serde_json::Value;
use sha2::{Digest, Sha256};

pub fn verify_binance_signature(payload: &Value, api_key: &str) -> bool {
    if api_key.is_empty() {
        return false;
    }

    let signature = match payload.get("signature") {
        Some(Value::String(s)) => s.clone(),
        _ => return false,
    };

    let msg = build_message_string(payload, "signature");
    let expected_sig = compute_sha256_hex(&(msg + api_key));

    constant_time_compare(&signature, &expected_sig)
}

fn build_message_string(payload: &Value, exclude_key: &str) -> String {
    let obj = match payload.as_object() {
        Some(o) => o,
        None => return String::new(),
    };

    let mut keys: Vec<_> = obj
        .keys()
        .filter(|k| *k != exclude_key)
        .collect();
    keys.sort();

    keys.iter()
        .filter_map(|k| obj.get(*k).map(|v| format_value(v)))
        .collect::<Vec<_>>()
        .join("")
}

fn format_value(v: &Value) -> String {
    match v {
        Value::Null => String::new(),
        Value::Bool(b) => b.to_string(),
        Value::Number(n) => n.to_string(),
        Value::String(s) => s.clone(),
        Value::Array(arr) => arr
            .iter()
            .map(format_value)
            .collect::<Vec<_>>()
            .join(""),
        Value::Object(obj) => obj
            .iter()
            .map(|(_, v)| format_value(v))
            .collect::<Vec<_>>()
            .join(""),
    }
}

fn compute_sha256_hex(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    hex::encode(result)
}

fn constant_time_compare(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }

    let a_bytes = a.as_bytes();
    let b_bytes = b.as_bytes();

    let mut result = 0u8;
    for i in 0..a_bytes.len() {
        result |= a_bytes[i] ^ b_bytes[i];
    }

    result == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_binance_signature_valid() {
        let api_key = "binance_key";
        let mut payload = serde_json::json!({
            "transaction_id": "TXN123",
            "amount": 500
        });

        let msg = "500TXN123".to_string() + api_key;
        let signature = compute_sha256_hex(&msg);

        let obj = payload.as_object_mut().unwrap();
        obj.insert("signature".to_string(), Value::String(signature));

        assert!(verify_binance_signature(&payload, api_key));
    }

    #[test]
    fn test_binance_signature_invalid() {
        let payload = serde_json::json!({
            "transaction_id": "TXN123",
            "amount": 500,
            "signature": "invalid_sig"
        });

        assert!(!verify_binance_signature(&payload, "binance_key"));
    }

    #[test]
    fn test_missing_api_key() {
        let payload = serde_json::json!({
            "amount": 1000,
            "signature": "some_sig"
        });

        assert!(!verify_binance_signature(&payload, ""));
    }

    #[test]
    fn test_build_message_string() {
        let payload = serde_json::json!({
            "z": "3",
            "a": "1",
            "m": "2",
            "signature": "ignore_me"
        });

        let msg = build_message_string(&payload, "signature");
        assert_eq!(msg, "123");
    }

    #[test]
    fn test_constant_time_compare() {
        assert!(constant_time_compare("abc", "abc"));
        assert!(!constant_time_compare("abc", "abd"));
        assert!(!constant_time_compare("ab", "abc"));
    }
}
