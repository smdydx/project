
from sqlalchemy import Column, Integer, Boolean
from backend.core.base import Base

class userSetting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    Referal = Column(Boolean, default=True)
    PhoneAutoCapture = Column(Boolean, default=True)
