from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import models
from .auth import get_current_user
from ..schemas import schemas

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/{link_id}", response_model=schemas.AnalyticsSummary)
def get_link_analytics(link_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify ownership
    link = db.query(models.Link).filter(models.Link.id == link_id, models.Link.user_id == current_user.id).first()
    if not link:
        return {"total_scans": 0, "unique_visitors": 0, "scans_by_country": {}, "scans_by_device": {}, "scans_over_time": []}

    total_scans = db.query(models.Visit).filter(models.Visit.link_id == link_id).count()
    unique_visitors = db.query(func.count(func.distinct(models.Visit.visitor_id))).filter(models.Visit.link_id == link_id).scalar()
    
    countries = db.query(models.Visit.country, func.count(models.Visit.id)).filter(models.Visit.link_id == link_id).group_by(models.Visit.country).all()
    devices = db.query(models.Visit.device, func.count(models.Visit.id)).filter(models.Visit.link_id == link_id).group_by(models.Visit.device).all()
    
    # Simple scans over time (last 7 days)
    over_time = db.query(func.date(models.Visit.timestamp), func.count(models.Visit.id)).filter(models.Visit.link_id == link_id).group_by(func.date(models.Visit.timestamp)).all()

    return {
        "total_scans": total_scans,
        "unique_visitors": unique_visitors,
        "scans_by_country": {c: count for c, count in countries},
        "scans_by_device": {d: count for d, count in devices},
        "scans_over_time": [{"date": str(d), "count": count} for d, count in over_time]
    }
