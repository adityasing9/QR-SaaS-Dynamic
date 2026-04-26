from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# For development, we'll use a placeholder or SQLite if MySQL isn't ready
# In production, this would be: mysql+pymysql://user:pass@host/db
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./qr_saas.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
