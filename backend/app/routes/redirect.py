from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import hashlib
from datetime import datetime
from ..database import get_db
from ..models import models
from ..services import redirect_engine

router = APIRouter()

@router.get("/r/{short_code}")
async def redirect_to_url(short_code: str, request: Request, db: Session = Depends(get_db)):
    link = db.query(models.models.Link).filter(models.models.Link.short_code == short_code, models.models.Link.is_active == True).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found or inactive")
    
    # Check Expiry
    if link.expires_at and link.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Link expired")
    
    # Check Scan Limit
    if link.max_scans != -1 and link.current_scans >= link.max_scans:
        raise HTTPException(status_code=410, detail="Scan limit reached")

    # Gather request data for rule engine & analytics
    user_agent = request.headers.get("user-agent", "")
    ip = request.client.host
    visitor_id = hashlib.md5(f"{ip}{user_agent}".encode()).hexdigest()
    
    # Mocking country/device/os for demo purposes
    # In production, use GeoIP2 or similar
    request_data = {
        "ip": ip,
        "user_agent": user_agent,
        "country": "Unknown", # Placeholder
        "device": "Desktop" if "Mobi" not in user_agent else "Mobile",
        "os": "Unknown",
        "browser": "Unknown"
    }

    # Process redirect engine
    target_url = redirect_engine.process_redirect(link, request_data)

    # Log analytics (Async would be better)
    visit = models.models.Visit(
        link_id=link.id,
        visitor_id=visitor_id,
        ip=ip,
        country=request_data["country"],
        device=request_data["device"],
        os=request_data["os"],
        browser=request_data["browser"]
    )
    db.add(visit)
    
    # Update scan count
    link.current_scans += 1
    
    db.commit()

    return RedirectResponse(url=target_url)
