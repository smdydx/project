
# Admin Dashboard Backend API

Production-quality FastAPI backend for the admin dashboard.

## 🚀 Features

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Robust ORM with relationship support
- **Pydantic** - Data validation using Python type annotations
- **PostgreSQL** - Production-ready database
- **CORS** - Configured for frontend integration
- **Comprehensive Dashboard Stats** - All metrics needed for admin dashboard

## 📊 Dashboard Endpoints

### GET `/api/v1/dashboard/stats`
Returns comprehensive dashboard statistics:
- Total registered users
- New users today
- KYC verification stats
- Prime user count
- Distributor LCR money
- Prime rewards distributed
- Mobile & DTH recharge counts

### GET `/api/v1/dashboard/charts`
Returns chart data:
- Daily transaction volume (7 days)
- Service distribution by category

### GET `/api/v1/dashboard/transactions/live`
Returns latest live transactions with user details

### GET `/api/v1/dashboard/users/recent`
Returns recently registered users

## 🛠️ Setup

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Run the server:**
```bash
python run.py
```

The API will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## 📁 Project Structure

```
backend/
├── api/
│   └── v1/
│       └── dashboard.py      # Dashboard endpoints
├── core/
│   ├── base.py              # SQLAlchemy base & mixins
│   ├── config.py            # Configuration management
│   └── database.py          # Database session
├── models/
│   ├── models.py            # Main models (User, Income, etc.)
│   ├── payment_gateway.py   # Payment transactions
│   ├── loans.py             # Loan applications
│   └── ...                  # Other models
├── schemas/
│   └── dashboard.py         # Pydantic response models
├── services/
│   └── dashboard_service.py # Business logic
├── main.py                  # FastAPI application
└── run.py                   # Startup script
```

## 🔒 Security

- Environment-based configuration
- CORS properly configured
- SQL injection prevention via SQLAlchemy
- Input validation with Pydantic

## 📈 Performance

- Database connection pooling
- Efficient queries with proper joins
- Indexed fields for fast lookups
- Optimized aggregations

## 🧪 Testing

API documentation with interactive testing:
- Navigate to `/docs` for Swagger UI
- Or `/redoc` for ReDoc

## 🚀 Deployment on Replit

The backend is ready to deploy on Replit with:
- Host: `0.0.0.0` (not localhost)
- Port: `8000` (configurable)
- CORS configured for Replit domains
