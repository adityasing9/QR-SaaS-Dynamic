import hashlib
import secrets
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-for-dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

def verify_password(plain_password, hashed_password):
    # Format: salt$hash
    try:
        salt, hash_val = hashed_password.split("$")
        return hash_val == hashlib.sha256((salt + plain_password).encode()).hexdigest()
    except:
        return False

def get_password_hash(password):
    salt = secrets.token_hex(8)
    hash_val = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${hash_val}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
