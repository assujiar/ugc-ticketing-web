PART 6C — Documentation (README, DEPLOYMENT, ENV templates)
FILES TO CREATE:

README.md
DEPLOYMENT.md
API_DOCUMENTATION.md
.env.production.example
CONTRIBUTING.md
CHANGELOG.md


FILE: README.md
markdown# UGC Ticketing Platform

A role-based ticketing platform for logistics and cargo operations designed to manage rate inquiries (RFQ) and general service requests while tracking departmental response times and maintaining comprehensive audit logs.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### Core Features
- **Multi-Role Management**: 9 distinct role types with granular permissions
- **Intelligent Ticketing**: Automated ticket creation with SLA tracking
- **Rate Inquiry Management**: Comprehensive 6-step RFQ form with auto-calculated volume/weight metrics
- **Real-time Metrics**: Dashboard with response time tracking per department
- **Modern UI**: Light glassmorphism design with vector icons
- **Responsive Design**: Fully adaptive across desktop and mobile platforms
- **Data Documentation**: Complete inquiry and rate history audit trail

### Ticket Types
- **RFQ (Rate Inquiry)**: For shipping rate requests with detailed cargo specifications
- **GEN (General Request)**: For service requests beyond rate inquiries

### Role Hierarchy
```
Super Admin (Platform Admin)
├── Marketing Manager → Marketing Staff
├── Sales Manager → Salesperson
├── Domestics Ops Manager
├── Exim Ops Manager
├── Import DTD Ops Manager
└── Warehouse & Traffic Ops Manager
```

### Departments
| Code | Department |
|------|------------|
| MKT | Marketing |
| SAL | Sales |
| DOM | Domestics Operations |
| EXI | Exim Operations |
| DTD | Import DTD Operations |
| TRF | Warehouse & Traffic Operations |

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15+ (React 19)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4 + Glassmorphism
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query + Zustand
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL 15+ (Supabase)
- **Auth**: Supabase Auth (JWT)

### Infrastructure
- **Database**: Supabase PostgreSQL with RLS
- **Hosting**: Vercel (Serverless)
- **Storage**: Supabase Storage

## 📦 Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account
- Git

### 1. Clone Repository
```bash
git clone https://github.com/your-org/ugc-ticketing.git
cd ugc-ticketing
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations (apply to Supabase)
# Upload migration files to Supabase Dashboard > SQL Editor

# Seed initial data
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login)
│   ├── (dashboard)/       # Protected pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── tickets/       # Ticket management
│   │   ├── admin/         # Admin pages
│   │   ├── settings/      # User settings
│   │   └── reports/       # Reports & analytics
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── tickets/           # Ticket components
│   ├── dashboard/         # Dashboard components
│   ├── admin/             # Admin components
│   ├── settings/          # Settings components
│   └── common/            # Shared components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── providers/             # React context providers
├── store/                 # Zustand stores
├── styles/                # Global styles
└── types/                 # TypeScript types
```

## 🔐 Authentication & Authorization

### Authentication
- JWT-based authentication via Supabase Auth
- Access token (24h expiry) + Refresh token
- Automatic token refresh

### Authorization (RBAC)
| Feature | Super Admin | Manager | Staff |
|---------|-------------|---------|-------|
| View All Tickets | ✓ | ✓ (Dept) | ✓ (Own) |
| Create Ticket | ✓ | ✓ | ✓ |
| Update Any Ticket | ✓ | ✓ (Dept) | ✗ |
| Assign Ticket | ✓ | ✓ | ✗ |
| Create Quote | ✓ | ✓ | ✗ |
| View Dashboard | All | Dept | Own |
| User Management | ✓ | ✗ | ✗ |

### Row Level Security (RLS)
All database tables are protected with RLS policies ensuring data isolation based on user roles and department membership.

## 🎫 Ticket Code Format
```
[TYPE][DEPT][DDMMYY][SEQ]

Examples:
- RFQDOM010226001 → RFQ, Domestics, Feb 1 2026, #001
- GENMKT150126005 → General, Marketing, Jan 15 2026, #005
```

## 📊 API Endpoints

### Authentication
```
POST /api/auth/login      # User login
POST /api/auth/refresh    # Refresh token
POST /api/auth/logout     # Logout
```

### Tickets
```
GET    /api/tickets              # List tickets
POST   /api/tickets              # Create ticket
GET    /api/tickets/:id          # Get ticket detail
PATCH  /api/tickets/:id          # Update ticket
DELETE /api/tickets/:id          # Delete ticket
POST   /api/tickets/:id/assign   # Assign ticket
POST   /api/tickets/:id/comments # Add comment
POST   /api/tickets/:id/attachments # Upload file
POST   /api/tickets/:id/quotes   # Create quote
```

### Dashboard
```
GET /api/dashboard/summary     # Summary metrics
GET /api/dashboard/sla-metrics # SLA performance
```

### Admin
```
GET    /api/admin/users      # List users
POST   /api/admin/users      # Create user
PATCH  /api/admin/users/:id  # Update user
DELETE /api/admin/users/:id  # Deactivate user
GET    /api/admin/audit      # Audit logs
```

## 🧪 Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/ugc-ticketing)

## 🎨 Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary Orange | `#ff4600` | Buttons, highlights |
| Primary Dark Blue | `#082567` | Headers, text |
| Accent Red | `#DC2F02` | Alerts, urgent |
| Navy Background | `#0f1A2D` | Dark surfaces |

### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 1rem;
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## 📞 Support

For support, email support@ugc-ticketing.com or open an issue on GitHub.

---

Built with ❤️ by UGC Team

FILE: DEPLOYMENT.md
markdown# Deployment Guide

This guide covers deploying UGC Ticketing Platform to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Supabase Setup](#supabase-setup)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- [Supabase](https://supabase.com) account
- [Vercel](https://vercel.com) account
- [GitHub](https://github.com) repository with the code
- Node.js 20+ installed locally

---

## Supabase Setup

### 1. Create Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Configure:
   - **Name**: `ugc-ticketing-prod`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### 2. Get Credentials

From Project Settings > API:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: For client-side
- **service_role key**: For server-side (keep secret!)

From Project Settings > Database:
- **Connection string**: For Prisma migrations

### 3. Run Database Migrations

Go to SQL Editor and run migrations in order:
```sql
-- 1. Run 00001_initial_schema.sql
-- 2. Run 00002_rls_policies.sql
-- 3. Run 00003_functions.sql
-- 4. Run 00004_indexes.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### 4. Configure Storage

1. Go to Storage
2. Create bucket: `attachments`
3. Set policy for authenticated users:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Allow users to read their uploads
CREATE POLICY "Users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'attachments');
```

### 5. Configure Auth

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure:
   - **Confirm email**: Disable for internal app
   - **Secure email change**: Enable
4. Go to URL Configuration:
   - **Site URL**: `https://your-domain.com`
   - **Redirect URLs**: Add your domains

---

## Vercel Deployment

### 1. Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import from GitHub repository
4. Select `ugc-ticketing` repo

### 2. Configure Build Settings
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
```

### 3. Set Environment Variables

Add all required environment variables (see below).

### 4. Deploy

Click "Deploy" and wait for build to complete.

### 5. Configure Domain (Optional)

1. Go to Project Settings > Domains
2. Add custom domain
3. Configure DNS:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`

---

## Environment Variables

### Required Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (for Prisma)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional Variables
```env
# Email (for notifications)
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@your-domain.com

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXX
```

### Vercel-Specific Variables
```env
# Set automatically by Vercel
VERCEL_URL
VERCEL_ENV
```

---

## Database Migrations

### Initial Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run seed (creates roles, departments, admin user)
npx prisma db seed
```

### Production Migrations

For schema changes in production:

1. Create migration locally:
```bash
npx prisma migrate dev --name your_migration_name
```

2. Deploy migration:
```bash
npx prisma migrate deploy
```

Or use Supabase Dashboard SQL Editor for manual migrations.

---

## Post-Deployment

### 1. Verify Deployment

- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard displays
- [ ] Create ticket works
- [ ] File upload works

### 2. Create Admin User

If seed didn't run, create manually:
```sql
-- Create admin user (after Supabase Auth user is created)
UPDATE users
SET 
  role_id = (SELECT id FROM roles WHERE name = 'super_admin'),
  full_name = 'Admin User',
  is_active = true
WHERE email = 'admin@your-domain.com';
```

### 3. Configure Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Sentry**: Add SENTRY_DSN for error tracking
3. **Uptime Monitoring**: Set up with UptimeRobot or similar

### 4. Set Up Backups

Supabase provides automatic backups. For additional safety:
- Enable Point-in-Time Recovery (Pro plan)
- Set up pg_dump scheduled exports

---

## CI/CD Pipeline

GitHub Actions automatically:
1. **On PR**: Lint, typecheck, test
2. **On merge to main**: Deploy to production

### Required Secrets

Add to GitHub Repository > Settings > Secrets:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DATABASE_URL
```

---

## Troubleshooting

### Build Fails
```bash
# Check for TypeScript errors
npm run typecheck

# Check for lint errors
npm run lint

# Test build locally
npm run build
```

### Database Connection Issues

1. Check DATABASE_URL format
2. Verify IP allowlist in Supabase
3. Check connection pooling settings

### Auth Not Working

1. Verify Supabase URL and keys
2. Check Site URL in Supabase Auth settings
3. Verify redirect URLs include your domain

### RLS Blocking Requests
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Temporarily disable for debugging (NOT in production!)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

### Slow Queries

1. Check Supabase Dashboard > Database > Query Performance
2. Add missing indexes
3. Optimize N+1 queries with proper joins

---

## Scaling

### Database
- Enable connection pooling (PgBouncer)
- Add read replicas for heavy read workloads
- Partition large tables (audit_logs)

### Application
- Vercel auto-scales serverless functions
- Enable ISR for static pages
- Use Edge Runtime for latency-sensitive routes

### Storage
- Enable CDN for static assets
- Compress images before upload
- Set cache headers

---

## Security Checklist

- [ ] All secrets in environment variables
- [ ] RLS enabled on all tables
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS prevention (React auto-escaping)
- [ ] CSRF protection (SameSite cookies)

---

## Support

For deployment issues:
- Check Vercel build logs
- Check Supabase logs
- Open GitHub issue with details

FILE: API_DOCUMENTATION.md
markdown# API Documentation

UGC Ticketing Platform API Reference

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

All API endpoints (except `/auth/login`) require authentication via JWT token.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Get Token
```http
POST /api/auth/login
```

---

## Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "profile": {
      "id": "uuid",
      "roles": { "name": "super_admin", "display_name": "Super Admin" },
      "departments": { "code": "MKT", "name": "Marketing" }
    },
    "session": {
      "access_token": "eyJ...",
      "refresh_token": "xxx",
      "expires_at": 1234567890
    }
  }
}
```

**Errors:**
- `400`: Validation error
- `401`: Invalid credentials
- `403`: Account deactivated

---

#### Logout
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Tickets

#### List Tickets
```http
GET /api/tickets
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| pageSize | number | Items per page (default: 20) |
| status | string | Filter by status |
| ticket_type | string | Filter by type (RFQ, GEN) |
| department_id | string | Filter by department |
| priority | string | Filter by priority |
| search | string | Search in subject/description |
| assigned_to_me | boolean | Show only assigned tickets |
| created_by_me | boolean | Show only created tickets |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ticket_code": "RFQDOM010226001",
      "ticket_type": "RFQ",
      "subject": "Rate inquiry for...",
      "status": "open",
      "priority": "medium",
      "created_at": "2026-01-01T00:00:00Z",
      "creator": { "id": "uuid", "full_name": "John Doe" },
      "departments": { "code": "DOM", "name": "Domestics" }
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

---

#### Create Ticket
```http
POST /api/tickets
```

**Request Body (General):**
```json
{
  "ticket_type": "GEN",
  "subject": "General inquiry",
  "description": "Detailed description...",
  "department_id": "uuid",
  "priority": "medium"
}
```

**Request Body (RFQ):**
```json
{
  "ticket_type": "RFQ",
  "subject": "Rate inquiry",
  "description": "Scope of work...",
  "department_id": "uuid",
  "priority": "high",
  "rfq_data": {
    "customer_name": "ABC Corp",
    "customer_email": "contact@abc.com",
    "customer_phone": "+62812345678",
    "service_type": "FCL",
    "cargo_category": "Genco",
    "cargo_description": "Electronics",
    "origin_address": "Jl. Sudirman 123",
    "origin_city": "Jakarta",
    "origin_country": "Indonesia",
    "destination_address": "123 Main St",
    "destination_city": "Singapore",
    "destination_country": "Singapore",
    "quantity": 10,
    "unit_of_measure": "pallets",
    "weight_per_unit": 500,
    "length": 120,
    "width": 100,
    "height": 150,
    "volume_per_unit": 1.8,
    "total_volume": 18,
    "scope_of_work": "Door to door delivery"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticket_code": "RFQDOM010226001",
    "status": "open",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

#### Get Ticket Detail
```http
GET /api/tickets/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticket_code": "RFQDOM010226001",
    "ticket_type": "RFQ",
    "subject": "Rate inquiry",
    "description": "...",
    "status": "in_progress",
    "priority": "high",
    "rfq_data": { ... },
    "creator": { ... },
    "assignee": { ... },
    "departments": { ... },
    "sla_tracking": {
      "first_response_at": "2026-01-01T01:00:00Z",
      "first_response_met": true,
      "resolution_met": null
    },
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T02:00:00Z"
  }
}
```

---

#### Update Ticket
```http
PATCH /api/tickets/:id
```

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "urgent",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### Assign Ticket
```http
POST /api/tickets/:id/assign
```

**Request Body:**
```json
{
  "assigned_to": "user-uuid",
  "notes": "Please handle this urgently"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "assignment-uuid",
    "ticket_id": "ticket-uuid",
    "assigned_to": "user-uuid",
    "assigned_by": "manager-uuid",
    "assigned_at": "2026-01-01T00:00:00Z"
  }
}
```

---

#### Add Comment
```http
POST /api/tickets/:id/comments
```

**Request Body:**
```json
{
  "content": "This is a comment",
  "is_internal": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "This is a comment",
    "is_internal": false,
    "created_by": "uuid",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

#### Upload Attachment
```http
POST /api/tickets/:id/attachments
Content-Type: multipart/form-data
```

**Request Body:**
- `file`: File (max 10MB, allowed: pdf, doc, docx, xls, xlsx, jpg, jpeg, png, gif)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "document.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf",
    "file_url": "https://..."
  }
}
```

---

#### Create Quote
```http
POST /api/tickets/:id/quotes
```

**Request Body:**
```json
{
  "amount": 5000.00,
  "currency": "USD",
  "valid_until": "2026-02-01",
  "terms": "FOB, 30 days payment"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "quote_number": "QT-001",
    "amount": 5000.00,
    "currency": "USD",
    "status": "draft"
  }
}
```

---

### Dashboard

#### Get Summary
```http
GET /api/dashboard/summary
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_tickets": 150,
    "open_tickets": 25,
    "in_progress_tickets": 30,
    "pending_tickets": 10,
    "resolved_tickets": 85,
    "tickets_by_status": [
      { "status": "open", "count": 25 },
      { "status": "in_progress", "count": 30 }
    ],
    "tickets_by_department": [
      { "department": "Domestics", "department_code": "DOM", "count": 45 }
    ],
    "recent_tickets": [ ... ]
  }
}
```

---

#### Get SLA Metrics
```http
GET /api/dashboard/sla-metrics?days=30
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "department_code": "DOM",
        "department_name": "Domestics",
        "first_response_compliance": 92.5,
        "resolution_compliance": 88.0,
        "avg_first_response_hours": 4.2,
        "avg_resolution_hours": 48.5
      }
    ],
    "trend": [
      { "date": "2026-01-01", "total": 10, "resolved": 8 }
    ],
    "overall": {
      "first_response_compliance": 90.0,
      "resolution_compliance": 85.0
    }
  }
}
```

---

### Admin

#### List Users
```http
GET /api/admin/users
```

**Query Parameters:**
- `page`: Page number
- `pageSize`: Items per page
- `search`: Search by name/email

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "is_active": true,
      "roles": { "name": "marketing_manager", "display_name": "Marketing Manager" },
      "departments": { "code": "MKT", "name": "Marketing" }
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

---

#### Create User
```http
POST /api/admin/users
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "full_name": "New User",
  "role_id": "role-uuid",
  "department_id": "dept-uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890