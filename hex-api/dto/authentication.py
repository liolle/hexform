from typing import Optional
from pydantic import BaseModel

class LoginForm(BaseModel):
    username : str
    password : str

class RegisterForm(BaseModel):
    username : str
    nickname: str
    password : str
    email : str | None = None

