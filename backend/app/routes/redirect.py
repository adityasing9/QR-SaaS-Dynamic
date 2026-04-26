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
    link = db.query(models.Link).filter(models.Link.short_code == short_code, models.Link.is_active == True).first()
    
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
    
    import urllib.request
    import json
    
    # Try to get country from Vercel or Cloudflare headers
    country = request.headers.get("x-vercel-ip-country") or request.headers.get("cf-ipcountry")
    if not country or country == "Unknown":
        try:
            if ip in ["127.0.0.1", "localhost", "::1"]:
                country = "Local"
            else:
                with urllib.request.urlopen(f"http://ip-api.com/json/{ip}", timeout=2) as response:
                    data = json.loads(response.read().decode())
                    country = data.get("country", "Unknown")
        except Exception:
            country = "Unknown"

    request_data = {
        "ip": ip,
        "user_agent": user_agent,
        "country": country,
        "device": "Desktop" if "Mobi" not in user_agent else "Mobile",
        "os": "Unknown",
        "browser": "Unknown"
    }

    # Process redirect engine
    target_url = redirect_engine.process_redirect(link, request_data)

    # Log analytics (Async would be better)
    visit = models.Visit(
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
