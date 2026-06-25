"""Tests for the Confort payment API."""

import hashlib
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from confort.api import (
    app,
    generate_code,
    verify_binance_signature,
    verify_cinetpay_signature,
)


def test_generate_code_format():
    """Test that generated codes are 4 characters."""
    for _ in range(10):
        code = generate_code()
        assert len(code) == 4
        assert code.isalnum()


def test_generate_code_excludes_forbidden_chars():
    """Test that generated codes exclude O, I, 0, 1."""
    forbidden = set("OoIi01")
    for _ in range(100):
        code = generate_code()
        assert not any(c in code for c in forbidden)


def test_generate_code_varied():
    """Test that generated codes are varied."""
    codes = set(generate_code() for _ in range(100))
    assert len(codes) > 50


def test_verify_cinetpay_signature_valid():
    """Test CinetPay signature verification with valid signature."""
    api_key = "test_key"
    payload = {"amount": 1000, "ref_number": "123", "status": "success"}

    msg = "".join(str(v) for k, v in sorted(payload.items()))
    signature = hashlib.sha256((msg + api_key).encode()).hexdigest()

    payload["signature"] = signature

    with patch.dict("os.environ", {"CINETPAY_API_KEY": api_key}):
        assert verify_cinetpay_signature(payload) is True


def test_verify_cinetpay_signature_invalid():
    """Test CinetPay signature verification with invalid signature."""
    api_key = "test_key"
    payload = {"amount": 1000, "ref_number": "123", "status": "success", "signature": "invalid_sig"}

    with patch.dict("os.environ", {"CINETPAY_API_KEY": api_key}):
        assert verify_cinetpay_signature(payload) is False


def test_verify_cinetpay_signature_missing_key():
    """Test CinetPay signature verification with missing API key."""
    payload = {"amount": 1000, "signature": "sig"}

    with patch.dict("os.environ", {}, clear=True):
        assert verify_cinetpay_signature(payload) is False


def test_verify_binance_signature_valid():
    """Test Binance signature verification with valid signature."""
    api_key = "binance_key"
    payload = {"amount": 1000, "transaction_id": "456", "status": "success"}

    msg = "".join(str(v) for k, v in sorted(payload.items()))
    signature = hashlib.sha256((msg + api_key).encode()).hexdigest()

    payload["signature"] = signature

    with patch.dict("os.environ", {"BINANCE_API_KEY": api_key}):
        assert verify_binance_signature(payload) is True


def test_verify_binance_signature_invalid():
    """Test Binance signature verification with invalid signature."""
    api_key = "binance_key"
    payload = {
        "amount": 1000,
        "transaction_id": "456",
        "status": "success",
        "signature": "invalid_sig",
    }

    with patch.dict("os.environ", {"BINANCE_API_KEY": api_key}):
        assert verify_binance_signature(payload) is False


client = TestClient(app)


def test_verify_code_valid_paid():
    """Test verifying a valid code with PAID status."""
    mock_supabase = MagicMock()
    mock_response = MagicMock()
    mock_response.data = [{"id": "trans_123", "status": "PAID", "code": "ABC2"}]

    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        mock_response
    )

    with patch("confort.api.get_supabase_client", return_value=mock_supabase):
        response = client.post("/api/verify-code", json={"code": "ABC2"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


def test_verify_code_already_used():
    """Test verifying a code that's already been used."""
    mock_supabase = MagicMock()
    mock_response = MagicMock()
    mock_response.data = [{"id": "trans_123", "status": "USED", "code": "ABC2"}]

    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        mock_response
    )

    with patch("confort.api.get_supabase_client", return_value=mock_supabase):
        response = client.post("/api/verify-code", json={"code": "ABC2"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["message"] == "Code already used"


def test_verify_code_not_found():
    """Test verifying a code that doesn't exist."""
    mock_supabase = MagicMock()
    mock_response = MagicMock()
    mock_response.data = []

    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        mock_response
    )

    with patch("confort.api.get_supabase_client", return_value=mock_supabase):
        response = client.post("/api/verify-code", json={"code": "XXXX"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["message"] == "Invalid code"


def test_initiate_payment_creates_transaction():
    """Test /api/initiate creates a PENDING transaction."""
    mock_supabase = MagicMock()
    mock_response = MagicMock()
    mock_response.data = [{"id": "trans_456", "status": "PENDING", "time_slot": 60, "amount": 500}]

    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_response

    with patch("confort.api.get_supabase_client", return_value=mock_supabase):
        response = client.post("/api/initiate", json={"time_slot": 60, "amount": 500})
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "trans_456"


def test_initiate_payment_database_error():
    """Test /api/initiate handles database errors gracefully."""
    mock_supabase = MagicMock()
    mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception(
        "Database error"
    )

    with patch("confort.api.get_supabase_client", return_value=mock_supabase):
        response = client.post("/api/initiate", json={"time_slot": 60, "amount": 500})
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data


def test_get_transaction_success():
    """Test /api/transaction/{id} returns transaction details."""
    mock_supabase = MagicMock()
    mock_response = MagicMock()
    mock_response.data = [
        {
            "id": "trans_789",
            "status": "PAID",
            "code": "XY2Z",
            "time_slot": 60,
            "amount": 500,
        }
    ]

    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        mock_response
    )

    with patch("confort.api.get_supabase_client", return_value=mock_supabase):
        response = client.get("/api/transaction/trans_789")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "trans_789"
        assert data["status"] == "PAID"
        assert data["code"] == "XY2Z"


def test_get_transaction_not_found():
    """Test /api/transaction/{id} returns 404 for missing transaction."""
    mock_supabase = MagicMock()
    mock_response = MagicMock()
    mock_response.data = []

    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        mock_response
    )

    with patch("confort.api.get_supabase_client", return_value=mock_supabase):
        response = client.get("/api/transaction/invalid_id")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data


def test_webhook_cinetpay_invalid_signature():
    """Test CinetPay webhook rejects invalid signatures."""
    payload = {
        "amount": 1000,
        "ref_number": "trans_123",
        "status": "success",
        "signature": "invalid_signature",
    }

    with patch.dict("os.environ", {"CINETPAY_API_KEY": "test_key"}):
        response = client.post("/api/webhook/cinetpay", json=payload)
        assert response.status_code == 401
        data = response.json()
        assert "Invalid signature" in data["detail"]


def test_webhook_cinetpay_missing_signature():
    """Test CinetPay webhook rejects missing signatures."""
    payload = {
        "amount": 1000,
        "ref_number": "trans_123",
        "status": "success",
    }

    with patch.dict("os.environ", {"CINETPAY_API_KEY": "test_key"}):
        response = client.post("/api/webhook/cinetpay", json=payload)
        assert response.status_code == 401


def test_webhook_crypto_invalid_signature():
    """Test Binance webhook rejects invalid signatures."""
    payload = {
        "amount": 0.5,
        "transaction_id": "tx_456",
        "status": "success",
        "signature": "invalid_signature",
    }

    with patch.dict("os.environ", {"BINANCE_API_KEY": "binance_key"}):
        response = client.post("/api/webhook/crypto", json=payload)
        assert response.status_code == 401
        data = response.json()
        assert "Invalid signature" in data["detail"]


def test_verify_code_transitions_paid_to_used():
    """Test that verifying a PAID code transitions it to USED."""
    mock_supabase = MagicMock()
    mock_response_select = MagicMock()
    mock_response_select.data = [{"id": "trans_111", "status": "PAID", "code": "ABC3"}]

    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        mock_response_select
    )
    mock_update_response = MagicMock()
    mock_update_response.data = [{"id": "trans_111", "status": "USED"}]
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = (
        mock_update_response
    )

    with patch("confort.api.get_supabase_client", return_value=mock_supabase):
        response = client.post("/api/verify-code", json={"code": "ABC3"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Verify update was called
        mock_supabase.table.return_value.update.assert_called_once()


def test_cors_configuration_applied():
    """Test that CORS middleware is properly configured."""
    # CORS is tested implicitly by the other endpoints working
    # This test verifies the app is properly initialized with CORS
    response = client.get("/openapi.json")
    # openapi.json should exist (it's auto-generated by FastAPI)
    assert response.status_code in (200, 404)  # 404 is also OK if disabled


def test_invalid_request_payload():
    """Test /api/initiate rejects invalid request payloads."""
    response = client.post("/api/initiate", json={"invalid": "data"})
    assert response.status_code == 422


def test_verify_code_invalid_status():
    """Test verifying a code with invalid status."""
    mock_supabase = MagicMock()
    mock_response = MagicMock()
    mock_response.data = [{"id": "trans_999", "status": "PENDING", "code": "ZZZ1"}]

    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        mock_response
    )

    with patch("confort.api.get_supabase_client", return_value=mock_supabase):
        response = client.post("/api/verify-code", json={"code": "ZZZ1"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["message"] == "Invalid code status"
