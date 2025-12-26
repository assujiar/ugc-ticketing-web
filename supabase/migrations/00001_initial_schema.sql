-- ============================================
-- UGC_Ticketing Initial Schema
-- Blueprint SSOT v1.0
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ROLES TABLE
-- 9 roles as defined in blueprint
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.roles IS 'Role definitions for RBAC (9 roles per blueprint)';

-- ============================================
-- DEPARTMENTS TABLE
-- 6 departments: MKT, SAL, DOM, EXI, DTD, TRF
-- ============================================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.departments IS 'Department configuration (6 departments per blueprint)';

-- ============================================
-- USERS TABLE
-- Linked to Supabase Auth via id (auth.users.id)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    department_id UUID REFERENCES public.departments(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles linked to Supabase Auth';

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- ============================================
-- TICKET_SEQUENCES TABLE
-- For generating unique ticket codes with daily sequence
-- ============================================
CREATE TABLE IF NOT EXISTS public.ticket_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type VARCHAR(10) NOT NULL,
    department_code VARCHAR(10) NOT NULL,
    date_key VARCHAR(6) NOT NULL, -- ddmmyy format
    last_sequence INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ticket_type, department_code, date_key)
);

COMMENT ON TABLE public.ticket_sequences IS 'Sequence tracking for ticket code generation';

-- ============================================
-- TICKETS TABLE
-- Main ticket entity with RFQ/GEN types
-- ============================================
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(20) UNIQUE NOT NULL,
    ticket_type VARCHAR(10) NOT NULL CHECK (ticket_type IN ('RFQ', 'GEN')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID NOT NULL REFERENCES public.departments(id),
    created_by UUID NOT NULL REFERENCES public.users(id),
    assigned_to UUID REFERENCES public.users(id),
    rfq_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.tickets IS 'All ticket records (RFQ and GEN types)';

-- Create indexes for tickets
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_code ON public.tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type ON public.tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_department_id ON public.tickets(department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status_dept ON public.tickets(status, department_id);

-- ============================================
-- TICKET_ASSIGNMENTS TABLE
-- Track assignment history
-- ============================================
CREATE TABLE IF NOT EXISTS public.ticket_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES public.users(id),
    assigned_by UUID NOT NULL REFERENCES public.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

COMMENT ON TABLE public.ticket_assignments IS 'Ticket assignment history';

-- Create indexes for ticket_assignments
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_ticket_id ON public.ticket_assignments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_assigned_to ON public.ticket_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_assigned_at ON public.ticket_assignments(assigned_at DESC);

-- ============================================
-- SLA_CONFIG TABLE
-- SLA targets per department/ticket type
-- ============================================
CREATE TABLE IF NOT EXISTS public.sla_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id),
    ticket_type VARCHAR(10) NOT NULL CHECK (ticket_type IN ('RFQ', 'GEN')),
    first_response_hours INTEGER DEFAULT 24,
    resolution_hours INTEGER DEFAULT 72,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(department_id, ticket_type)
);

COMMENT ON TABLE public.sla_config IS 'SLA targets per department and ticket type';

-- ============================================
-- SLA_TRACKING TABLE
-- Track actual SLA performance per ticket
-- ============================================
CREATE TABLE IF NOT EXISTS public.sla_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID UNIQUE NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    first_response_at TIMESTAMPTZ,
    first_response_sla_hours INTEGER NOT NULL,
    first_response_met BOOLEAN,
    resolution_at TIMESTAMPTZ,
    resolution_sla_hours INTEGER NOT NULL,
    resolution_met BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sla_tracking IS 'Actual SLA performance tracking per ticket';

-- Create index for sla_tracking
CREATE INDEX IF NOT EXISTS idx_sla_tracking_ticket_id ON public.sla_tracking(ticket_id);

-- ============================================
-- TICKET_COMMENTS TABLE
-- Internal and external communications
-- ============================================
CREATE TABLE IF NOT EXISTS public.ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ticket_comments IS 'Ticket comments (internal and external)';

-- Create indexes for ticket_comments
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON public.ticket_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON public.ticket_comments(created_at DESC);

-- ============================================
-- AUDIT_LOGS TABLE
-- Append-only audit trail
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID NOT NULL REFERENCES public.users(id),
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.audit_logs IS 'Append-only audit trail for all operations';

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================
-- RATE_QUOTES TABLE
-- Rate proposals for RFQ tickets
-- ============================================
CREATE TABLE IF NOT EXISTS public.rate_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    quote_number VARCHAR(30) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    valid_until DATE NOT NULL,
    terms TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.rate_quotes IS 'Rate quotes/proposals for RFQ tickets';

-- Create indexes for rate_quotes
CREATE INDEX IF NOT EXISTS idx_rate_quotes_ticket_id ON public.rate_quotes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_rate_quotes_quote_number ON public.rate_quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_rate_quotes_status ON public.rate_quotes(status);
CREATE INDEX IF NOT EXISTS idx_rate_quotes_created_by ON public.rate_quotes(created_by);

-- ============================================
-- TICKET_ATTACHMENTS TABLE
-- File storage references
-- ============================================
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ticket_attachments IS 'File attachments for tickets';

-- Create indexes for ticket_attachments
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_uploaded_by ON public.ticket_attachments(uploaded_by);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- Auto-update updated_at column
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.tickets;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.ticket_sequences;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.ticket_sequences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.sla_config;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.sla_config
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.sla_tracking;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.sla_tracking
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.ticket_comments;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.rate_quotes;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.rate_quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SEED DATA: ROLES (9 roles from blueprint)
-- ============================================
INSERT INTO public.roles (name, display_name, description) VALUES
    ('super_admin', 'Super Admin', 'Platform Administrator with unrestricted access'),
    ('marketing_manager', 'Marketing Manager', 'Manager of Marketing Department'),
    ('marketing_staff', 'Marketing Staff', 'Staff member of Marketing Department'),
    ('sales_manager', 'Sales Manager', 'Manager of Sales Department'),
    ('salesperson', 'Salesperson', 'Sales team member'),
    ('domestics_ops_manager', 'Domestics Ops Manager', 'Manager of Domestics Operations Department'),
    ('exim_ops_manager', 'Exim Ops Manager', 'Manager of Exim Operations Department'),
    ('import_dtd_ops_manager', 'Import DTD Ops Manager', 'Manager of Import DTD Operations Department'),
    ('warehouse_traffic_ops_manager', 'Warehouse & Traffic Ops Manager', 'Manager of Warehouse & Traffic Operations Department')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- ============================================
-- SEED DATA: DEPARTMENTS (6 departments from blueprint)
-- ============================================
INSERT INTO public.departments (code, name, description) VALUES
    ('MKT', 'Marketing', 'Marketing Department'),
    ('SAL', 'Sales', 'Sales Department'),
    ('DOM', 'Domestics Operations', 'Domestics Operations Department'),
    ('EXI', 'Exim Operations', 'Exim Operations Department'),
    ('DTD', 'Import DTD Operations', 'Import DTD Operations Department'),
    ('TRF', 'Warehouse & Traffic Operations', 'Warehouse & Traffic Operations Department')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ============================================
-- SEED DATA: SLA_CONFIG (Default SLA for each department)
-- ============================================
INSERT INTO public.sla_config (department_id, ticket_type, first_response_hours, resolution_hours)
SELECT d.id, t.ticket_type, 24, 72
FROM public.departments d
CROSS JOIN (VALUES ('RFQ'), ('GEN')) AS t(ticket_type)
ON CONFLICT (department_id, ticket_type) DO UPDATE SET
    first_response_hours = EXCLUDED.first_response_hours,
    resolution_hours = EXCLUDED.resolution_hours;