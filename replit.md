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
**Date**: October 16, 2025

Successfully configured the dual-backend architecture:
1. **Python Backend Setup**:
   - Installed Python 3.11 and FastAPI dependencies
   - Fixed model import paths (changed from app.core to core)
   - Fixed missing SQLAlchemy imports in model files
   - Connected to PostgreSQL database
   - Created all database tables successfully
   - Backend API running on port 8000

2. **Node.js Server Setup**:
   - Installed npm dependencies
   - Configured Express + Vite server on port 5000
   - Set up WebSocket for real-time updates
   - Configured Vite proxy to route /api/* to Python backend

3. **Current Status**:
   - Both workflows running successfully
   - Database connected and tables created
   - Frontend loading but API endpoint mismatch needs resolution
   - WebSocket connections working

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
- **API Endpoint Mismatch**: Frontend expects `/api/dashboard/*` but Python backend uses `/api/*`
  - Need to either update frontend API calls or add `/dashboard` prefix to backend routes
- **Vite HMR WebSocket**: Connection issues in Replit iframe (non-critical, hot reload still works)

## User Preferences
- Using PostgreSQL database with full BBPS data models
- Dual-backend architecture: Node.js for serving + Python for business logic
- TypeScript for type safety across frontend and Node.js server
- Modern UI with gradient accents and smooth transitions
