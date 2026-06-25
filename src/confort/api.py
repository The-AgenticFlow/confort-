"""FastAPI backend for Confort payment processing."""

import hashlib
import hmac
import os
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

from confort.code_generator import generate_code
from confort.db import get_supabase_client

app = FastAPI()


class InitiateRequest(BaseModel):
    time_slot: int
    amount: int


class InitiateResponse(BaseModel):
    id: str


class TransactionResponse(BaseModel):
    id: str
    status: str
    code: str | None = None
    time_slot: int
    amount: int


class VerifyCodeRequest(BaseModel):
    code: str


class VerifyCodeResponse(BaseModel):
    success: bool
    message: str | None = None


@app.post("/api/initiate", response_model=InitiateResponse)
async def initiate_payment(request: InitiateRequest):
    """Create a PENDING transaction and return its ID."""
    supabase = get_supabase_client()

    try:
        response = (
            supabase.table("transactions")
            .insert(
                {
                    "time_slot": request.time_slot,
                    "amount": request.amount,
                    "payment_method": "MOMO",
                    "status": "PENDING",
                }
            )
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create transaction")

        return InitiateResponse(id=response.data[0]["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/transaction/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: str):
    """Retrieve transaction details including payment status and code."""
    supabase = get_supabase_client()

    try:
        response = supabase.table("transactions").select("*").eq("id", transaction_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Transaction not found")

        transaction = response.data[0]
        return TransactionResponse(
            id=transaction["id"],
            status=transaction["status"],
            code=transaction.get("code"),
            time_slot=transaction["time_slot"],
            amount=transaction["amount"],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/verify-code", response_model=VerifyCodeResponse)
async def verify_code(request: VerifyCodeRequest):
    """Verify a code and update transaction status from PAID to USED."""
    supabase = get_supabase_client()

    try:
        response = supabase.table("transactions").select("*").eq("code", request.code).execute()

        if not response.data:
            return VerifyCodeResponse(success=False, message="Invalid code")

        transaction = response.data[0]

        if transaction["status"] == "USED":
            return VerifyCodeResponse(success=False, message="Code already used")

        if transaction["status"] == "PAID":
            supabase.table("transactions").update({"status": "USED"}).eq(
                "id", transaction["id"]
            ).execute()

            return VerifyCodeResponse(success=True)

        return VerifyCodeResponse(success=False, message="Invalid code status")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def verify_cinetpay_signature(payload: dict[str, Any]) -> bool:
    """Verify CinetPay webhook signature."""
    api_key = os.getenv("CINETPAY_API_KEY")
    signature = payload.get("signature")

    if not api_key or not signature:
        return False

    msg = "".join(str(v) for k, v in sorted(payload.items()) if k != "signature")
    expected_sig = hashlib.sha256((msg + api_key).encode()).hexdigest()

    return hmac.compare_digest(signature, expected_sig)


def verify_binance_signature(payload: dict[str, Any]) -> bool:
    """Verify Binance Pay webhook signature."""
    api_key = os.getenv("BINANCE_API_KEY")
    signature = payload.get("signature")

    if not api_key or not signature:
        return False

    msg = "".join(str(v) for k, v in sorted(payload.items()) if k != "signature")
    expected_sig = hashlib.sha256((msg + api_key).encode()).hexdigest()

    return hmac.compare_digest(signature, expected_sig)


async def process_payment(
    payload: dict[str, Any], transaction_id_key: str = "ref_number"
) -> dict[str, str]:
    """Generic payment processor for webhook handlers."""
    supabase = get_supabase_client()

    trans_id = payload.get(transaction_id_key)
    if not trans_id:
        raise HTTPException(status_code=400, detail="Missing transaction ID")

    try:
        query = supabase.table("transactions").select("*").eq("id", trans_id).execute()

        if not query.data:
            raise HTTPException(status_code=404, detail="Transaction not found")

        transaction = query.data[0]

        if transaction["status"] != "PENDING":
            return {"status": "ok"}

        max_attempts = 10
        for _ in range(max_attempts):
            code = generate_code()

            check = supabase.table("transactions").select("id").eq("code", code).execute()

            if not check.data:
                break
        else:
            raise HTTPException(status_code=500, detail="Failed to generate unique code")

        supabase.table("transactions").update(
            {
                "status": "PAID",
                "code": code,
                "cinetpay_trans_id": trans_id,
            }
        ).eq("id", trans_id).execute()

        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/webhook/cinetpay")
async def webhook_cinetpay(request: Request):
    """Handle CinetPay webhook for successful payments."""
    payload = await request.json()

    if not verify_cinetpay_signature(payload):
        raise HTTPException(status_code=401, detail="Invalid signature")

    result = await process_payment(payload, transaction_id_key="ref_number")
    return result


@app.post("/api/webhook/crypto")
async def webhook_crypto(request: Request):
    """Handle Binance Pay (crypto) webhook for successful payments."""
    payload = await request.json()

    if not verify_binance_signature(payload):
        raise HTTPException(status_code=401, detail="Invalid signature")

    result = await process_payment(payload, transaction_id_key="transaction_id")
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
