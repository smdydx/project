# Auto-Generated CRUD API System

## Overview
This system automatically generates CRUD endpoints for all SQLAlchemy models in the FastAPI backend, providing a complete admin dashboard with dynamic data browsing capabilities.

## Features Implemented

### ✅ Auto-Model Discovery
- Automatically scans `Base.registry.mappers` to discover all models
- No manual registration required - truly auto-generated
- Generates endpoints for 30+ models automatically

### ✅ Complete Metadata Endpoints
Each model has a `/meta` endpoint that returns:
- Field names and types (string, integer, boolean, decimal, timestamp, enum, relationship)
- Required/optional status
- Unique constraints
- Foreign key references
- Enum choices
- Relationship information

Example: `GET /api/crud/users/meta`

### ✅ Advanced Filtering & Sorting
Query parameters supported:
- `?status=active` - Exact match
- `?created_after__gte=2025-01-01` - Greater than or equal
- `?amount__lt=1000` - Less than
- `?name__like=john` - Partial match
- `?status__in=active,pending` - Multiple values
- `?ordering=-created_at,amount` - Sort descending by created_at, then ascending by amount

### ✅ Pagination
- Default: `page=1`, `page_size=20`
- Max page_size: `200`
- Response includes metadata: `{"page": 1, "page_size": 20, "total": 500}`

### ✅ Search Functionality
- `?search=keyword` - Searches across all text fields

### ✅ CSV Export
- `?format=csv` - Export data as CSV file
- Perfect for Excel/Google Sheets

### ✅ Security (Auth Guards)
- Mutations (POST/PUT/DELETE) are protected with `require_admin` dependency
- Currently disabled until proper JWT authentication is implemented
- Only GET endpoints (list and detail) are active

## API Endpoints

For each model, the following endpoints are auto-generated:

### List Records
```
GET /api/crud/<model>/?page=1&page_size=20
```

Response:
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 150
  }
}
```

### Get Single Record
```
GET /api/crud/<model>/{id}
```

### Get Metadata
```
GET /api/crud/<model>/meta
```

Response:
```json
{
  "status": "success",
  "data": {
    "name": "Users",
    "tableName": "users",
    "fields": [
      {
        "name": "UserID",
        "type": "integer",
        "readonly": true
      },
      {
        "name": "Email",
        "type": "string",
        "required": true
      },
      {
        "name": "prime_status",
        "type": "boolean",
        "default": false
      }
    ]
  }
}
```

## Frontend Integration

### Model Browser
A dynamic Model Browser UI at `/model-browser` that:
- Lists all available models
- Displays data in tables
- Supports search and pagination
- Exports to CSV
- Auto-refreshes data

### API Client
```typescript
import apiClient from '@/lib/api';

// Fetch users
const users = await apiClient.get('/api/crud/users');

// With filters
const filtered = await apiClient.get('/api/crud/users?status=active&page=2');

// Export CSV
window.open('http://localhost:8000/api/crud/users?format=csv', '_blank');
```

## Models Auto-Discovered (30+)

- **User Management**: Users, UserProfile, UserUPI, Aadhar Users, PAN Verification
- **Transactions**: Transactions, Wallet, P2P, Withdrawal History  
- **Payments**: Payment Gateway, Payment Settings, Bank Details
- **Income**: Direct Income, Level Income, Magic Income, Royalty Income, Prime Activations
- **Recharge**: Recharge Incentives, Coin Distributions
- **Loans**: Auto, Business, Home, Machine, Personal, Private Funding, Loan Against Property
- **Services**: Service Requests, Job Logs, Registrations
- **System**: Banners, Devices, Messages, Settings, Operators, Circles

## Architecture

```
backend/
├── core/
│   ├── crud_generator.py    # Generic CRUD logic
│   ├── auth.py              # Auth guards (placeholder)
│   └── database.py          # DB session
├── api/v1/
│   └── auto_crud.py         # Auto-discovery & registration
└── main.py                  # FastAPI app with auto-routes

client/
├── src/
│   ├── pages/
│   │   └── ModelBrowser.tsx # Dynamic model browser UI
│   └── lib/
│       └── api.ts           # API client
```

## Security Notes

⚠️ **Mutations Currently Disabled**
- POST, PUT, PATCH, DELETE endpoints return 501 (Not Implemented)
- Reason: No authentication system yet
- All endpoints currently READ-ONLY

## Next Steps

1. **Implement JWT Authentication**
   - Add user login/signup
   - Generate JWT tokens
   - Update `get_current_user()` in `backend/core/auth.py`

2. **Enable Mutations**
   - Remove 501 responses from `require_admin()`
   - Add role-based access control
   - Add mutation endpoints (POST/PUT/DELETE)

3. **Add Validation**
   - Use Pydantic schemas for request validation
   - Add business logic validators

4. **Swagger Documentation**
   - Already available at `http://localhost:8000/docs`
   - Shows all auto-generated endpoints

## Testing

1. Start FastAPI backend:
```bash
cd backend
python main.py
```

2. Start React frontend:
```bash
npm run dev
```

3. Visit:
- Admin Dashboard: `http://localhost:5000`
- Model Browser: `http://localhost:5000/model-browser`
- API Docs: `http://localhost:8000/docs`
- Root API: `http://localhost:8000/` (lists all models)

## Example API Calls

```bash
# List all users
curl http://localhost:8000/api/crud/users

# Get user metadata
curl http://localhost:8000/api/crud/users/meta

# Filter active prime users
curl "http://localhost:8000/api/crud/users?prime_status=true&activation_status=true"

# Search users
curl "http://localhost:8000/api/crud/users?search=john"

# Export to CSV
curl "http://localhost:8000/api/crud/users?format=csv" > users.csv

# Get single user
curl http://localhost:8000/api/crud/users/1
```

## Contributing

To add new models:
1. Create model in `backend/models/`
2. Import in `backend/models/__init__.py`
3. Restart FastAPI - endpoints auto-generate!

No manual registration needed! 🚀
