"""FastAPI backend for Confort payment processing."""

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from confort.db import get_supabase_client

app = FastAPI()


class InitiateRequest(BaseModel):
    time_slot: int
    amount: int


class InitiateResponse(BaseModel):
    id: str


@app.post("/api/initiate", response_model=InitiateResponse)
async def initiate_payment(request: InitiateRequest):
    """Create a PENDING transaction and return its ID."""
    supabase = get_supabase_client()

    try:
        response = supabase.table("transactions").insert({
            "time_slot": request.time_slot,
            "amount": request.amount,
            "payment_method": "MOMO",
            "status": "PENDING",
        }).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create transaction")

        return InitiateResponse(id=response.data[0]["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
