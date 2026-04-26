from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Rule Schemas
class RuleBase(BaseModel):
    rule_type: str
    rule_value: str
    target_url: str
    priority: int = 0

class RuleCreate(RuleBase):
    pass

class RuleResponse(RuleBase):
    id: int
    class Config:
        from_attributes = True

# ABTest Schemas
class ABTestBase(BaseModel):
    url_a: str
    url_b: str
    ratio_a: float = 0.5
    ratio_b: float = 0.5

class ABTestCreate(ABTestBase):
    pass

class ABTestResponse(ABTestBase):
    id: int
    class Config:
        from_attributes = True

# Link Schemas
class LinkBase(BaseModel):
    title: Optional[str] = None
    original_url: str
    is_active: bool = True
    max_scans: int = -1
    expires_at: Optional[datetime] = None

class LinkCreate(LinkBase):
    rules: Optional[List[RuleCreate]] = []
    ab_test: Optional[ABTestCreate] = None

class LinkResponse(LinkBase):
    id: int
    short_code: str
    current_scans: int
    created_at: datetime
    rules: List[RuleResponse]
    ab_tests: List[ABTestResponse]
    class Config:
        from_attributes = True

# Analytics Schemas
class AnalyticsSummary(BaseModel):
    total_scans: int
    unique_visitors: int
    scans_by_country: dict
    scans_by_device: dict
    scans_over_time: list
