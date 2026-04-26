from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    links = relationship("Link", back_populates="owner")

class Link(Base):
    __tablename__ = "links"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    short_code = Column(String(10), unique=True, index=True, nullable=False)
    title = Column(String(255))
    original_url = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    max_scans = Column(Integer, default=-1) # -1 for unlimited
    current_scans = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="links")
    rules = relationship("Rule", back_populates="link", cascade="all, delete-orphan")
    ab_tests = relationship("ABTest", back_populates="link", cascade="all, delete-orphan")
    visits = relationship("Visit", back_populates="link", cascade="all, delete-orphan")

class Rule(Base):
    __tablename__ = "rules"
    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey("links.id"))
    rule_type = Column(String(50)) # country, device, time
    rule_value = Column(String(255))
    target_url = Column(Text, nullable=False)
    priority = Column(Integer, default=0)

    link = relationship("Link", back_populates="rules")

class ABTest(Base):
    __tablename__ = "ab_tests"
    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey("links.id"))
    url_a = Column(Text, nullable=False)
    url_b = Column(Text, nullable=False)
    ratio_a = Column(Float, default=0.5)
    ratio_b = Column(Float, default=0.5)

    link = relationship("Link", back_populates="ab_tests")

class Visit(Base):
    __tablename__ = "visits"
    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey("links.id"))
    visitor_id = Column(String(255)) # hash(IP + UA)
    ip = Column(String(50))
    country = Column(String(100))
    device = Column(String(50))
    os = Column(String(50))
    browser = Column(String(50))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    link = relationship("Link", back_populates="visits")
    
    # Indexes for analytics
    __table_args__ = (
        Index('idx_link_timestamp', 'link_id', 'timestamp'),
    )
