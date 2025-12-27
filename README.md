# UGC Ticketing Platform

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

### Role HierarchySuper Admin (Platform Admin)
├── Marketing Manager → Marketing Staff
├── Sales Manager → Salesperson
├── Domestics Ops Manager
├── Exim Ops Manager
├── Import DTD Ops Manager
└── Warehouse & Traffic Ops Manager

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
```bashgit clone https://github.com/your-org/ugc-ticketing.git
cd ugc-ticketing

### 2. Install Dependencies
```bashnpm install

### 3. Environment Setup
```bashcp .env.example .env.local

Edit `.env.local` with your credentials:
```envNEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url

### 4. Database Setup
```bashGenerate Prisma client
npm run db:generateRun migrations (apply to Supabase)
Upload migration files to Supabase Dashboard > SQL EditorSeed initial data
npm run db:seed

### 5. Run Development Server
```bashnpm run dev

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structuresrc/
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

## 🎫 Ticket Code Format[TYPE][DEPT][DDMMYY][SEQ]Examples:

RFQDOM010226001 → RFQ, Domestics, Feb 1 2026, #001
GENMKT150126005 → General, Marketing, Jan 15 2026, #005


## 📊 API Endpoints

### AuthenticationPOST /api/auth/login      # User login
POST /api/auth/refresh    # Refresh token
POST /api/auth/logout     # Logout

### TicketsGET    /api/tickets              # List tickets
POST   /api/tickets              # Create ticket
GET    /api/tickets/:id          # Get ticket detail
PATCH  /api/tickets/:id          # Update ticket
DELETE /api/tickets/:id          # Delete ticket
POST   /api/tickets/:id/assign   # Assign ticket
POST   /api/tickets/:id/comments # Add comment
POST   /api/tickets/:id/attachments # Upload file
POST   /api/tickets/:id/quotes   # Create quote

### DashboardGET /api/dashboard/summary     # Summary metrics
GET /api/dashboard/sla-metrics # SLA performance

### AdminGET    /api/admin/users      # List users
POST   /api/admin/users      # Create user
PATCH  /api/admin/users/:id  # Update user
DELETE /api/admin/users/:id  # Deactivate user
GET    /api/admin/audit      # Audit logs

## 🧪 Testing
```bashRun all tests
npm run testRun tests in watch mode
npm run test:watchRun tests with coverage
npm run test:coverageRun tests for CI
npm run test:ci

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
| `npm run tree` | Display project structure |

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
```css.glass-card {
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.5);
border-radius: 1rem;
}

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.
