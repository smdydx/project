# BBPS Admin Dashboard

## Overview
A modern full-stack admin dashboard for BBPS (Bharat Bill Payment System) payment management. This application provides a comprehensive interface for managing billers, users, transactions, complaints, reports, and system settings.

## Project Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Node.js Server**: Express.js + TypeScript (serves frontend via Vite, handles WebSocket for real-time updates)
- **Python Backend**: FastAPI + SQLAlchemy (REST API on port 8000)
- **Database**: PostgreSQL (Replit built-in)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with dark mode support
- **Real-time**: WebSocket for live dashboard updates

## Recent Changes
**Date**: October 19, 2025

### FastAPI Backend Migration & CORS Security - COMPLETED ✅

Successfully migrated to FastAPI-only backend with secure CORS configuration:

1. **Python Dependencies Installation**:
   - Installed all required packages: fastapi, uvicorn, pytz, sqlalchemy, pydantic, etc.
   - Created FastAPI Backend workflow running on port 8000

2. **CORS Security Implementation**:
   - Fixed critical security vulnerability (removed wildcard "*" from allow_origins)
   - Configured specific localhost origins for development (ports 3000, 5000)
   - Added regex pattern for Replit production domains (*.replit.dev, *.repl.co)
   - Maintained secure credentials handling with restricted origins

3. **Architecture Validation**:
   - Node.js Express server (port 5000): Serves React frontend via Vite, handles WebSocket, proxies /api to FastAPI
   - FastAPI backend (port 8000): Handles all REST API endpoints
   - Database: PostgreSQL with successful connection
   - Both workflows running and tested successfully

4. **Testing & Verification**:
   - API proxy working correctly (Node.js → FastAPI)
   - Frontend loading properly
   - Database connection successful
   - All security checks passed

### Dashboard & User Management Restructuring - COMPLETED ✅

Successfully restructured the admin dashboard with new statistics and simplified user management:

1. **7 Dashboard Statistics Cards**:
   - Total Users (registered base)
   - Total New SignUp (last 7 days)
   - Total LCR Money (sum of all INR wallet balances)
   - Total LCR Reward Distributed (sum of direct + level income)
   - Total Prime Users
   - Total Verified Users (KYC verified)
   - Total Payment Requests

2. **Backend API Updates**:
   - Enhanced `backend/services/dashboard_service.py` to calculate all 7 new metrics
   - Updated `backend/schemas/dashboard.py` with new response fields
   - Modified `/api/v1/users/all` to filter by Prime/Normal only (removed KYC status)
   - Kept `/api/v1/kyc/verification` for KYC-specific filtering

3. **Frontend Restructuring**:
   - Updated `Dashboard.tsx` to display all 7 statistics cards
   - Simplified `AllUsers.tsx` to show only Prime/Normal filter, removed KYC status column
   - Added Wallet Balance column to All Users table
   - Fixed badge logic to match backend response format (Prime/Normal)
   - Kept `KYCVerification.tsx` with KYC status filter and View Details modal

4. **Menu Structure**:
   - User Management now has sub-items: All Users and KYC Verification
   - Clean separation between user type filtering and KYC verification workflows

**Date**: October 16, 2025

### Auto-Generated CRUD API System - COMPLETED ✅

Successfully built a comprehensive auto-generated CRUD system:

1. **Auto-Discovery Engine**:
   - Automatically scans SQLAlchemy models using `Base.registry.mappers`
   - No manual registration required - truly auto-generated
   - Discovered and created endpoints for 30+ models

2. **Advanced CRUD Generator** (`backend/core/crud_generator.py`):
   - Generic CRUD endpoints with filtering, sorting, pagination
   - Advanced filter operators: `__gte`, `__lt`, `__like`, `__in`
   - Search across all text fields
   - CSV export functionality
   - Metadata endpoints with complete field information

3. **Enhanced Metadata System**:
   - Field types (string, integer, boolean, decimal, timestamp, enum, relationship)
   - Foreign key references
   - Enum choices
   - Relationship information
   - Required/optional/readonly status

4. **Security Implementation**:
   - Auth guard system in `backend/core/auth.py`
   - Mutations (POST/PUT/DELETE) disabled until JWT auth is implemented
   - Currently READ-ONLY for safety

5. **Frontend Integration**:
   - Dynamic Model Browser at `/model-browser`
   - Lists all models with data tables
   - Search, filter, pagination, CSV export
   - Connected to FastAPI backend (port 8000)

6. **Documentation**:
   - Complete API documentation in `AUTO_CRUD_README.md`
   - Swagger docs at `http://localhost:8000/docs`
   - Root endpoint lists all available models

## Project Structure
```
├── client/              # Frontend application (React + TypeScript)
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── common/  # Reusable components
│   │   │   ├── layout/  # Layout components (Header, Sidebar)
│   │   │   └── pages/   # Page components
│   │   ├── contexts/    # React contexts (Theme)
│   │   ├── hooks/       # Custom hooks (WebSocket)
│   │   ├── services/    # API services
│   │   ├── types/       # TypeScript types
│   │   └── App.tsx      # Main app component
│   └── index.html
├── server/              # Node.js Express server
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes (proxies to Python)
│   ├── websocket.ts     # WebSocket setup
│   ├── dataSimulator.ts # Real-time data simulator
│   └── vite.ts          # Vite server setup
├── backend/             # Python FastAPI backend
│   ├── api/v1/          # API endpoints
│   ├── core/            # Core config, database
│   ├── models/          # SQLAlchemy models
│   ├── services/        # Business logic services
│   ├── schemas/         # Pydantic schemas
│   ├── main.py          # FastAPI app
│   └── run.py           # Server startup script
├── shared/              # Shared types and schemas
└── attached_assets/     # Static assets
```

## Available Pages
- **Dashboard**: Overview with key metrics, charts, and live transaction stream
- **Billers Management**: Manage billing service providers
- **User Management**: Manage system users
- **Transactions**: View and manage payment transactions
- **Complaints**: Handle customer complaints
- **Reports & Analytics**: Generate and view reports
- **Service Categories**: Manage service categories
- **Reconciliation**: Financial reconciliation tools
- **Settings**: System configuration

## Development
- **Workflows**:
  - **Server** (Port 5000): Node.js + Express + Vite + WebSocket
  - **Backend API** (Port 8000): Python FastAPI + PostgreSQL
- **Database**: PostgreSQL (DATABASE_URL configured)
- **Hot Module Replacement**: Enabled for frontend
- **Dark Mode**: Full theme support with toggle

## Known Issues
- **WebSocket Errors**: Frontend tries to connect to WebSocket on port 8000 but no WS server exists yet (non-critical, only affects real-time dashboard updates)
- **Authentication Not Implemented**: Mutations (POST/PUT/DELETE) are disabled until JWT auth is added
- **Vite HMR WebSocket**: Connection issues in Replit iframe (non-critical, hot reload still works)

## User Preferences
- Using PostgreSQL database with full BBPS data models
- Dual-backend architecture: Node.js for serving + Python for business logic
- TypeScript for type safety across frontend and Node.js server
- Modern UI with gradient accents and smooth transitions
