# BBPS Admin Dashboard

## Overview
A modern full-stack admin dashboard for BBPS (Bharat Bill Payment System) payment management. This application provides a comprehensive interface for managing billers, users, transactions, complaints, reports, and system settings.

## Project Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with dark mode support
- **Storage**: In-memory storage (MemStorage) - ready to be extended with database integration

## Recent Changes (Migration from Bolt to Replit)
**Date**: October 15, 2025

Successfully migrated the project from Bolt to Replit environment:
1. Restructured project to fullstack template (client/src, server, shared directories)
2. Set up Express backend server with Vite integration
3. Converted routing from state-based to wouter-based navigation
4. Installed fullstack dependencies (express, wouter, tanstack-query, drizzle-orm, etc.)
5. Configured proper path aliases (@/, @shared/, @assets/)
6. Updated Tailwind config for new directory structure
7. Verified application is working correctly

## Project Structure
```
├── client/              # Frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── common/  # Reusable components
│   │   │   ├── layout/  # Layout components (Header, Sidebar)
│   │   │   └── pages/   # Page components
│   │   ├── contexts/    # React contexts (Theme)
│   │   ├── data/        # Mock data
│   │   ├── lib/         # Query client setup
│   │   ├── types/       # TypeScript types
│   │   └── App.tsx      # Main app component
│   └── index.html
├── server/              # Backend application
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Storage interface
│   └── vite.ts          # Vite server setup
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema (Drizzle)
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
- Run `npm run dev` to start the development server
- Frontend and backend run on port 5000
- Hot module replacement (HMR) enabled for frontend
- Dark mode support with theme toggle

## User Preferences
- Using in-memory storage by default (can be extended to use database)
- Fullstack architecture with separate client and server
- TypeScript for type safety
- Modern UI with gradient accents and smooth transitions
