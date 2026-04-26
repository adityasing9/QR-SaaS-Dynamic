from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import string
import random
from ..database import get_db
from ..models import models
from ..schemas import schemas
from .auth import get_current_user
from ..services import qr_service

router = APIRouter(prefix="/links", tags=["links"])

def generate_short_code(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@router.post("/", response_model=schemas.LinkResponse)
def create_link(link_in: schemas.LinkCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    short_code = generate_short_code()
    # Ensure uniqueness
    while db.query(models.Link).filter(models.Link.short_code == short_code).first():
        short_code = generate_short_code()
    
    db_link = models.Link(
        user_id=current_user.id,
        short_code=short_code,
        title=link_in.title,
        original_url=link_in.original_url,
        max_scans=link_in.max_scans,
        expires_at=link_in.expires_at
    )
    db.add(db_link)
    db.commit()
    db.refresh(db_link)

    # Add Rules
    for rule in link_in.rules:
        db_rule = models.Rule(link_id=db_link.id, **rule.dict())
        db.add(db_rule)
    
    # Add A/B Test
    if link_in.ab_test:
        db_ab = models.ABTest(link_id=db_link.id, **link_in.ab_test.dict())
        db.add(db_ab)
    
    db.commit()
    db.refresh(db_link)
    return db_link

@router.get("/", response_model=List[schemas.LinkResponse])
def get_links(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Link).filter(models.Link.user_id == current_user.id).all()

@router.get("/{link_id}/qr")
def get_link_qr(link_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    link = db.query(models.Link).filter(models.Link.id == link_id, models.Link.user_id == current_user.id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # In production, use the actual domain
    short_url = f"https://qr-saa-s-dynamic.vercel.app/r/{link.short_code}"
    qr_data = qr_service.generate_qr_base64(short_url)
    return {"qr_code": qr_data}

@router.delete("/{link_id}")
def delete_link(link_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    link = db.query(models.Link).filter(models.Link.id == link_id, models.Link.user_id == current_user.id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    db.delete(link)
    db.commit()
    return {"detail": "Link deleted"}
