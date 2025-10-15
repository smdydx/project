
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, VARCHAR, TIMESTAMP, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.core.base import Base, IntPrimaryKeyMixin

class ServiceJobLog(IntPrimaryKeyMixin, Base):
    __tablename__ = "service_job_log"
    job_type: Mapped[str] = mapped_column(VARCHAR(30), index=True)
    status: Mapped[str] = mapped_column(VARCHAR(20), server_default=text("'pending'"))
    message: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

class ServiceRegistration(Base):
    __tablename__ = "service_registration"
    id = Column(Integer, primary_key=True, index=True)
    mobile = Column(String, nullable=False)
    service_type = Column(String, nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)
