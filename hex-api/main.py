from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from routers import *

app = FastAPI(title="HexForm API", version="0.0.1")


app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_origins=["*"],
    allow_credentials=True,
    #allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


# Routers
app.include_router(pingRouter, tags=["Health check"])
app.include_router(authRouter, tags=["Authentication"])
app.include_router(surveysRouter, tags=["perform survey actions"])


@app.get("/")
def root():
    return {"message": "Survey API is running", "docs": "/docs"}
