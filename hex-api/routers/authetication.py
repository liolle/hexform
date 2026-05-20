from fastapi import APIRouter, Depends, HTTPException, status

from dto import LoginForm,RegisterForm
from typing import TYPE_CHECKING
from services import AuthService 

#if TYPE_CHECKING:

router = APIRouter()

@router.post("/login")
def login(data:LoginForm,auth:AuthService = Depends(AuthService)):
    res = auth.login(data)

    if not res.success: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return {"token": f"{res.keys["token"] if "token" in res.keys else ""}"}

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data:RegisterForm,auth:AuthService = Depends(AuthService)):
    res = auth.register(data)

    if not res.success: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= res.keys["reason"] 
        )

    return "" 
