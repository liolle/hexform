from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()

@router.get("/ping")
def ping():
    return {"message":f"Pong: {datetime.now()}"}
