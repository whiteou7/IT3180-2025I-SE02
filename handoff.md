# Apartment Management System - Product Handoff Documentation

**Version:** 1.0  
**Date:** 2024  
**Project:** Intro to SE - SE02  
**Development Team:** SE02 Team

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Deployment Requirements](#deployment-requirements)
5. [Environment Configuration](#environment-configuration)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Key Features Implementation](#key-features-implementation)
9. [User Stories Coverage](#user-stories-coverage)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

The **Apartment Management System** is a comprehensive web application designed for managing apartment complexes with integrated features for resident management, vehicle tracking, document management, and incident reporting.

### Core Functionality

- **Resident Management**: Complete user registration, profile management, and apartment assignment
- **Apartment Information**: Building and apartment lookup with member management
- **Vehicle Access Control**: Vehicle registration and entry/exit tracking
- **Document Management**: Electronic document storage using Supabase
- **Property Reports**: Missing property notification and tracking system
- **Social Feed**: Community posts and updates
- **Admin Dashboard**: Management interface for administrators

---

## System Architecture

### Architecture Pattern
- **Frontend**: Next.js 15 (Pages Router) with React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Storage**: Supabase Storage (for documents)
- **State Management**: Zustand
- **UI Framework**: TailwindCSS + shadcn/ui components

### Directory Structure
```
introse-se02/
├── components/ # React components
│ ├── ui/ # Reusable UI components (shadcn)
│ └── [feature].tsx # Feature-specific components
├── pages/ # Next.js pages
│ ├── api/ # API routes
│ └── [routes].tsx # Page routes
├── types/ # TypeScript type definitions
├── hooks/ # Custom React hooks
├── lib/ # Utility functions
├── store/ # State management (Zustand)
└── styles/ # Global styles
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.6 (Pages Router)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: TailwindCSS 4.x
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: lucide-react
- **State Management**: Zustand 5.0.8
- **Forms**: react-hook-form + zod
- **HTTP Client**: ofetch

### Backend
- **API Routes**: Next.js API Routes
- **Database ORM**: postgres (node-postgres)
- **Authentication**: bcryptjs for password hashing
- **Storage**: Supabase JavaScript SDK

### Development Tools
- **Linter**: ESLint with Next.js config
- **Package Manager**: npm

---

## Deployment Requirements

### Prerequisites
- Node.js 18+ (recommended: 20+)
- PostgreSQL database
- Supabase account for document storage
- Environment variables configured

### Required Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Connection
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-supabase-anon-key
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd introse-se02
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run database migrations**
   ```bash
   # Refer to schema.md for database schema
   psql -d your_database -f schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## Environment Configuration

### Development
- **Port**: 3000
- **Database**: Local PostgreSQL instance
- **Storage**: Supabase (cloud)

### Production Considerations
- Enable HTTPS
- Set secure cookie settings
- Configure CORS appropriately
- Use connection pooling for database
- Set up proper logging and monitoring

---

## API Documentation

### Authentication & Users

#### `POST /api/users`
Create a new user account
- **Request Body**: `{ email, fullName, password }`
- **Response**: `{ success, message, data: { userId } }`

#### `GET /api/users`
Get all users (admin only)
- **Response**: `{ success, message, data: User[] }`

#### `GET /api/users/[id]`
Get user information
- **Response**: `{ success, message, data: User }`

#### `PUT /api/users/[id]`
Update user information
- **Request Body**: `{ email, fullName, role, yearOfBirth, gender }`
- **Response**: `{ success, message, data: User }`

### Apartment Management

#### `GET /api/apartments`
Get all apartments with members
- **Response**: `{ success, message, data: Apartment[] }`

#### `GET /api/apartments/[id]`
Get specific apartment with members
- **Response**: `{ success, message, data: Apartment }`

#### `POST /api/apartments`
Create new apartment
- **Request Body**: `{ buildingId, floor, apartmentNumber, monthlyFee }`
- **Response**: `{ success, message, data: { apartmentId } }`

#### `PUT /api/apartments/[id]`
Update apartment information
- **Request Body**: `{ buildingId, floor, apartmentNumber, monthlyFee }`
- **Response**: `{ success, message, data: Apartment }`

#### `PUT /api/users/[id]/apartments`
Assign user to apartment
- **Request Body**: `{ apartmentId }`
- **Response**: `{ success, message, data: { apartmentId } }`

### Property Management

#### `GET /api/users/[id]/properties`
Get user's properties
- **Response**: `{ success, message, data: Property[] }`

#### `POST /api/users/[id]/properties`
Create new property
- **Request Body**: `{ propertyName }`
- **Response**: `{ success, message, data: { propertyId } }`

#### `GET /api/properties/available`
Get available properties for reporting
- **Query**: `?userId=<userId>`
- **Response**: `{ success, message, data: Property[] }`

### Vehicle Management

#### `POST /api/users/[id]/vehicle`
Register vehicle for user
- **Request Body**: `{ licensePlate }`
- **Response**: `{ success, message, data: { vehicleId, propertyId, licensePlate } }`

#### `POST /api/users/[id]/vehicle/checkin`
Toggle vehicle entry/exit
- **Response**: `{ success, message, data: { time } }`

#### `GET /api/users/[id]/vehicle-info`
Get vehicle information
- **Response**: `{ success, message, data: { vehicleId, propertyId, licensePlate } }`

#### `GET /api/users/[id]/vehicle-logs`
Get vehicle entry/exit logs
- **Response**: `{ success, message, data: VehicleLog[] }`

#### `GET /api/vehicles/checkin`
Get all vehicle logs with filtering
- **Query**: `?userId=<userId>&filter=week|month|year`
- **Response**: `{ success, message, data: { logs } }`

### Document Management

#### `GET /api/users/[id]/documents`
List user documents (PDF files)
- **Response**: `{ success, message, data: Document[] }`
- **Note**: Upload handled via Supabase SDK directly

### Property Reports

#### `GET /api/property-reports`
Get all property reports
- **Response**: `{ success, message, data: PropertyReport[] }`

#### `POST /api/property-reports`
Create property report
- **Request Body**: `{ userId, propertyId, content }`
- **Response**: `{ success, message, data: PropertyReport }`

#### `PATCH /api/property-reports/[id]`
Update property report
- **Request Body**: `{ approved?, issuedStatus?, status?, issuerId? }`
- **Response**: `{ success, message, data: PropertyReport }`

### Posts

#### `GET /api/posts`
Get all posts
- **Response**: `{ success, message, data: Post[] }`

#### `POST /api/posts`
Create new post
- **Request Body**: `{ content, userId }`
- **Response**: `{ success, message, data: Post[] }`

---

## Database Schema

Refer to `schema.md` for complete database schema. Key tables:

- `users`: User accounts and information
- `apartments`: Apartment information
- `properties`: User properties
- `vehicles`: Vehicle registrations
- `vehicle_logs`: Vehicle entry/exit tracking
- `property_reports`: Missing property reports
- `posts`: Community posts
- `buildings`: Building information

---

## Key Features Implementation

### 1. User Authentication Flow
- Uses Zustand for client-side state management
- Session persists in browser (not server-side sessions)
- Demo accounts hardcoded for testing

### 2. Admin Dashboard
- Accessible at `/admin/dashboard`
- User and apartment management
- Admin-only access via role check

### 3. Vehicle Access Control
- Check-in/check-out system with timestamp tracking
- Latest log determines current state
- One vehicle per user (1:1 relationship)

### 4. Document Storage
- Uses Supabase Storage bucket named "users"
- PDF files only
- Organized by user ID folders

### 5. Property Reports
- Track missing property notifications
- Status workflow: not found → found
- Admin approval system

---

## User Stories Coverage

### ✅ Implemented Features

**US-001**: Resident Information Input
- ✅ Create and update resident profiles
- ✅ Assign residents to apartments
- ✅ Form validation and error handling

**US-002**: Apartment Information Lookup
- ✅ Apartment search and details
- ✅ Member listing per apartment
- ✅ Building and floor information

**US-009**: Vehicle Access Control
- ✅ Vehicle registration
- ✅ Entry/exit tracking
- ✅ Log history viewing

**US-011**: Electronic Document Management
- ✅ Document upload (PDF)
- ✅ Document viewing
- ✅ Document deletion

**US-017**: Residence Management
- ✅ Resident status tracking
- ✅ Apartment assignment management
- ✅ User role management (admin/tenant)

**US-008**: Incident Reporting
- ✅ Property report creation
- ✅ Report status tracking
- ✅ Admin review workflow

**US-024**: Missing Property Notification
- ✅ Property loss reporting
- ✅ Found property notifications
- ✅ Property availability tracking

---

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network connectivity

**Supabase Storage Errors**
- Verify environment variables
- Check bucket permissions
- Ensure "users" bucket exists

**Build Failures**
- Run `npm install` to update dependencies
- Check Node.js version compatibility
- Clear `.next` cache: `rm -rf .next`

**API Errors**
- Check browser console for detailed errors
- Verify API route syntax
- Review server logs

### Debug Mode

Run with verbose logging:
```bash
NODE_ENV=development npm run dev
```

---

## Support & Maintenance

### Contact Information
- **Development Team**: SE02
- **Repository**: [GitHub Repository URL]
- **Documentation**: This file + inline code comments

### Maintenance Schedule
- Regular security updates recommended
- Database backups: Configure daily backups
- Monitor error logs regularly

---

## Future Enhancements

Potential improvements for future iterations:
- [ ] Implement proper JWT authentication
- [ ] Add email notification system
- [ ] Real-time updates (WebSocket)
- [ ] Mobile app support
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Integration with payment systems

---