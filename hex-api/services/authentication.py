from typing import TYPE_CHECKING, Any

from datetime import datetime, timezone, timedelta
#from typing import Optional
#from jose import JWTError, jwt

from jwt.types import Options
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
#from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import dbConnection
from utils import generate_id, Result
from dotenv import load_dotenv
from database import Users
from jwt.exceptions import (
    ExpiredSignatureError,
    InvalidTokenError,
    InvalidSignatureError,
    DecodeError,
    InvalidKeyError,
    MissingRequiredClaimError,
    ImmatureSignatureError
)

import jwt

import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
HASH_ALGORITHM = os.getenv("HASH_ALGORITHM")
ACCESS_TOKEN_EXPIRE = os.getenv("ACCESS_TOKEN_EXPIRE")

ctx = CryptContext(
    schemes=["sha256_crypt"],
    sha256_crypt__rounds=10000
)

if TYPE_CHECKING:
    from dto import LoginForm,RegisterForm

def generate_password(password:str)->str:
    hashed_password = ctx.hash(password)
    return hashed_password

def verify_password(password:str, hash:str):
    return ctx.verify(password,hash)

def generate_token(claims:dict[str,Any])->str:
    expire = int(ACCESS_TOKEN_EXPIRE) if ACCESS_TOKEN_EXPIRE else 1440
    now = datetime.now(tz=timezone.utc)
    final_claims : dict[str,Any] = {
        "exp" : int((now + timedelta(minutes=expire)).timestamp()) ,
        "nbf" : int(now.timestamp()) ,
        "iat" : int(now.timestamp()) ,
    }

    for key,val in claims.items():
        if key not in ["exp","nbf","iat"]:
            final_claims[key] = val

    token = jwt.encode(final_claims, SECRET_KEY, algorithm="HS256")
    return token

def verify_token(token)->Result:

    verify_options:Options = {
        "verify_signature": True,
        "verify_exp": True,
        "verify_nbf": True,
        "verify_iat": True,
        #"verify_aud": expected_audience is not None,
        #"verify_iss": expected_issuer is not None
    }

    try:

        claims = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms="HS256",
            #audience=expected_audience,
            #issuer=expected_issuer,
            options=verify_options
        )
        return Result(True, keys={"claims": claims})

    except ExpiredSignatureError:
        # Token has expired
        return Result(False, keys={"reason": "Token has expired. Please login again."})

    except ImmatureSignatureError:
        # Token not yet valid (nbf claim is in the future)
        return Result(False, keys={"reason": "Token is not yet valid."})

    except InvalidSignatureError:
        # Signature doesn't match
        return Result(False, keys={"reason": "Invalid token signature. Token may have been tampered with."})

    except MissingRequiredClaimError :
        # Required claim is missing (e.g., exp, iat, nbf)
        return Result(False, keys={"reason": "Token is malformed: missing required claims."})

    except InvalidKeyError:
        # Cryptographic key is invalid
        return Result(False, keys={"reason": "Authentication configuration error."})

    except DecodeError:
        # Token can't be decoded (malformed)
        return Result(False, keys={"reason": "Token is malformed."})

    except InvalidTokenError:
        # Generic invalid token error (parent of many above)
        return Result(False, keys={"reason": "Invalid token."})
    except Exception as e:
        return Result(False, keys={"reason": "Invalid token."})

error_mapping = {
    "uk_users_nickname": "Nickname already taken",
}

class AuthService():

    def register(self, form:RegisterForm)->Result:
        # generate hashed password
        hashed_passwor =  generate_password(form.password)
        id = generate_id(32,"USR")

        with dbConnection() as con:
            try:
                user = Users(
                    id=id,
                    nickname=form.nickname,
                    username=form.username,
                    email=form.email if form.email else None, 
                    password=hashed_passwor)

                con.add(user)
                con.commit()
                return Result(True)
            except IntegrityError as e:
                con.rollback()
                error_msg = str(e.orig).lower()

                for key,val in error_mapping.items():
                    if key in error_msg:
                        return Result(False, keys={"reason": val}) 

                return Result(False, keys={"reason": "Invalid input"}) 
            except Exception as e:
                con.rollback()

                return Result(False, keys={
                    "reason" : "Invalid input"
                })


    def login(self, form:LoginForm)->Result:
        stm = select(Users).where(Users.username == form.username)
        claims = {}

        with dbConnection() as con:
            user = con.execute(stm).scalar_one_or_none()

            if user == None or not verify_password(form.password,user.password): 
                return Result(False, keys={
                    "reason" : "Invalid creadentials"
                })

            claims["nickname"] = user.nickname
            claims["id"] = user.id
            if user.email :
                claims["email"] = user.email

        #generate token
        token = generate_token(claims)

        return Result(True, keys={
            "token" : token
        })

