# Deployment Guide

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
```sql-- 1. Run 00001_initial_schema.sql
-- 2. Run 00002_rls_policies.sql
-- 3. Run 00003_functions.sql
-- 4. Run 00004_indexes.sql

Or use Supabase CLI:
```bashsupabase db push

### 4. Configure Storage

1. Go to Storage
2. Create bucket: `attachments`
3. Set policy for authenticated users:
```sql-- Allow authenticated users to upload
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');-- Allow users to read their uploads
CREATE POLICY "Users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'attachments');

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

### 2. Configure Build SettingsFramework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm ci

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
```envSupabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...Database (for Prisma)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgresApp
NEXT_PUBLIC_APP_URL=https://your-domain.com

### Optional Variables
```envEmail (for notifications)
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@your-domain.comMonitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxxAnalytics
NEXT_PUBLIC_GA_ID=G-XXXXXXX

### Vercel-Specific Variables
```envSet automatically by Vercel
VERCEL_URL
VERCEL_ENV

---

## Database Migrations

### Initial Setup
```bashGenerate Prisma client
npx prisma generatePush schema to database
npx prisma db pushRun seed (creates roles, departments, admin user)
npx prisma db seed

### Production Migrations

For schema changes in production:

1. Create migration locally:
```bashnpx prisma migrate dev --name your_migration_name

2. Deploy migration:
```bashnpx prisma migrate deploy

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
```sql-- Create admin user (after Supabase Auth user is created)
UPDATE users
SET
role_id = (SELECT id FROM roles WHERE name = 'super_admin'),
full_name = 'Admin User',
is_active = true
WHERE email = 'admin@your-domain.com';

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

Add to GitHub Repository > Settings > Secrets:VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DATABASE_URL

---

## Troubleshooting

### Build Fails
```bashCheck for TypeScript errors
npm run typecheckCheck for lint errors
npm run lintTest build locally
npm run build

### Database Connection Issues

1. Check DATABASE_URL format
2. Verify IP allowlist in Supabase
3. Check connection pooling settings

### Auth Not Working

1. Verify Supabase URL and keys
2. Check Site URL in Supabase Auth settings
3. Verify redirect URLs include your domain

### RLS Blocking Requests
```sql-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';-- Temporarily disable for debugging (NOT in production!)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;

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