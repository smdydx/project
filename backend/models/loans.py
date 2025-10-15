
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from backend.core.base import Base

class AutoLoan(Base):
    __tablename__ = "auto_loan_applications"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone_number = Column(String(15), nullable=False)
    vehicle_type = Column(String(10), nullable=False)
    vehicle_value = Column(Float, nullable=False)
    emis_paid = Column(Integer, nullable=True)
    user_mobile = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class BusinessLoan(Base):
    __tablename__ = "business_loan_applications"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone_number = Column(String(15), nullable=False)
    business_name = Column(String(100), nullable=False)
    business_type = Column(String(100), nullable=False)
    annual_turnover = Column(Float, nullable=False)
    loan_amount = Column(Float, nullable=False)
    collateral_value = Column(Float, nullable=False)
    business_continuity = Column(Integer, nullable=False)
    user_mobile = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class HomeLoan(Base):
    __tablename__ = "home_loan_applications"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone_number = Column(String(15), nullable=False)
    loan_amount = Column(Float, nullable=False)
    property_value = Column(Float, nullable=False)
    income_continuity = Column(String(100), nullable=False)
    employment_status = Column(String(50), nullable=False)
    user_mobile = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class LoanAgainstProperty(Base):
    __tablename__ = "loan_against_property_applications"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone_number = Column(String(15), nullable=False)
    loan_amount = Column(Float, nullable=False)
    property_value = Column(Float, nullable=False)
    income_continuity = Column(String(100), nullable=False)
    employment_status = Column(String(50), nullable=False)
    user_mobile = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class MachineLoan(Base):
    __tablename__ = "machine_loan_applications"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone_number = Column(String(15), nullable=False)
    business_name = Column(String(100), nullable=False)
    machine_type = Column(String(100), nullable=False)
    machine_cost = Column(Float, nullable=False)
    loan_amount = Column(Float, nullable=False)
    business_continuity = Column(Integer, nullable=False)
    co_applicant = Column(String(100), nullable=True)
    user_mobile = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PersonalLoan(Base):
    __tablename__ = "personal_loan_applications"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone_number = Column(String(15), nullable=False)
    employment_status = Column(String(20), nullable=False)
    company_name = Column(String(100), nullable=True)
    monthly_income = Column(Float, nullable=False)
    existing_emis = Column(Float, nullable=True)
    loan_amount = Column(Float, nullable=False)
    tenure = Column(Integer, nullable=False)
    cibil_score = Column(Integer, nullable=False)
    user_mobile = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PrivateFunding(Base):
    __tablename__ = "private_funding_applications"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone_number = Column(String(15), nullable=False)
    loan_amount = Column(Float, nullable=False)
    annual_turnover = Column(Float, nullable=False)
    employment_type = Column(String(10), nullable=False)
    funding_purpose = Column(String(255), nullable=False)
    user_mobile = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
