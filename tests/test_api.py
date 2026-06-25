"""Tests for the Confort payment API."""

import hashlib
from unittest.mock import patch

from confort.api import (
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
    forbidden = set('OoIi01')
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
    payload = {
        "amount": 1000,
        "ref_number": "123",
        "status": "success",
        "signature": "invalid_sig"
    }

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
        "signature": "invalid_sig"
    }

    with patch.dict("os.environ", {"BINANCE_API_KEY": api_key}):
        assert verify_binance_signature(payload) is False
