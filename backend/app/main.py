from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import models
from .routes import auth, links, redirect, analytics

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="QR SaaS API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://qr-saa-s-dynamic.vercel.app",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(links.router)
app.include_router(analytics.router)
app.include_router(redirect.router)

@app.get("/")
def root():
    return {"message": "Welcome to QR SaaS API"}
