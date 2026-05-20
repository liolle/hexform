from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import pingRouter

app = FastAPI(title="HexForm API", version="0.0.1")

app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(pingRouter, tags=["Health check"])

@app.get("/")
def root():
    return {"message": "Survey API is running", "docs": "/docs"}
