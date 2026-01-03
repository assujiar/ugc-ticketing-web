-- ============================================
-- UGC_Ticketing Strategic Indexes
-- Blueprint SSOT v1.0
-- Optimized for common query patterns
-- ============================================

-- ============================================
-- COMPOSITE INDEXES FOR TICKET QUERIES
-- ============================================

-- Index for filtering by status and department (common dashboard query)
CREATE INDEX IF NOT EXISTS idx_tickets_status_dept_created 
    ON public.tickets(status, department_id, created_at DESC);

-- Index for filtering by type and status
CREATE INDEX IF NOT EXISTS idx_tickets_type_status 
    ON public.tickets(ticket_type, status);

-- Index for user's tickets (created or assigned)
CREATE INDEX IF NOT EXISTS idx_tickets_created_by_status 
    ON public.tickets(created_by, status);

CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to_status 
    ON public.tickets(assigned_to, status) 
    WHERE assigned_to IS NOT NULL;

-- Index for priority-based queries
CREATE INDEX IF NOT EXISTS idx_tickets_priority_status 
    ON public.tickets(priority, status);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_tickets_created_at_dept 
    ON public.tickets(created_at DESC, department_id);

-- Index for searching ticket codes
CREATE INDEX IF NOT EXISTS idx_tickets_code_trgm 
    ON public.tickets USING gin(ticket_code gin_trgm_ops);

-- Note: gin_trgm_ops requires pg_trgm extension
-- Enable it if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- INDEXES FOR SLA TRACKING QUERIES
-- ============================================

-- Index for SLA compliance reports
CREATE INDEX IF NOT EXISTS idx_sla_tracking_first_response_met 
    ON public.sla_tracking(first_response_met) 
    WHERE first_response_met IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sla_tracking_resolution_met 
    ON public.sla_tracking(resolution_met) 
    WHERE resolution_met IS NOT NULL;

-- Index for pending SLA (not yet responded/resolved)
CREATE INDEX IF NOT EXISTS idx_sla_tracking_pending_response 
    ON public.sla_tracking(ticket_id) 
    WHERE first_response_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sla_tracking_pending_resolution 
    ON public.sla_tracking(ticket_id) 
    WHERE resolution_at IS NULL;

-- ============================================
-- INDEXES FOR TICKET COMMENTS
-- ============================================

-- Index for fetching comments by ticket
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_created 
    ON public.ticket_comments(ticket_id, created_at DESC);

-- Index for internal vs external comments
CREATE INDEX IF NOT EXISTS idx_ticket_comments_internal 
    ON public.ticket_comments(ticket_id, is_internal);

-- ============================================
-- INDEXES FOR RATE QUOTES
-- ============================================

-- Index for quotes by ticket and status
CREATE INDEX IF NOT EXISTS idx_rate_quotes_ticket_status 
    ON public.rate_quotes(ticket_id, status);

-- Index for valid quotes (not expired)
CREATE INDEX IF NOT EXISTS idx_rate_quotes_valid 
    ON public.rate_quotes(ticket_id, valid_until) 
    WHERE status IN ('draft', 'sent');

-- ============================================
-- INDEXES FOR TICKET ATTACHMENTS
-- ============================================

-- Index for attachments by ticket
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_created 
    ON public.ticket_attachments(ticket_id, created_at DESC);

-- ============================================
-- INDEXES FOR TICKET ASSIGNMENTS
-- ============================================

-- Index for assignment history by ticket
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_ticket_date 
    ON public.ticket_assignments(ticket_id, assigned_at DESC);

-- Index for user's assignments
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_assignee_date 
    ON public.ticket_assignments(assigned_to, assigned_at DESC);

-- ============================================
-- INDEXES FOR AUDIT LOGS
-- ============================================

-- Index for audit log queries by table and record
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
    ON public.audit_logs(table_name, record_id, created_at DESC);

-- Index for audit log queries by user
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date 
    ON public.audit_logs(user_id, created_at DESC);

-- Index for audit log queries by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_date 
    ON public.audit_logs(action, created_at DESC);

-- ============================================
-- INDEXES FOR USERS TABLE
-- ============================================

-- Index for active users by department
CREATE INDEX IF NOT EXISTS idx_users_dept_active 
    ON public.users(department_id, is_active) 
    WHERE is_active = TRUE;

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role_active 
    ON public.users(role_id, is_active);

-- ============================================
-- INDEXES FOR TICKET SEQUENCES
-- ============================================

-- Composite index for sequence lookup
CREATE INDEX IF NOT EXISTS idx_ticket_sequences_lookup 
    ON public.ticket_sequences(ticket_type, department_code, date_key);

-- ============================================
-- FULL TEXT SEARCH INDEXES
-- ============================================

-- Create text search configuration for tickets
CREATE INDEX IF NOT EXISTS idx_tickets_subject_fts 
    ON public.tickets USING gin(to_tsvector('english', subject));

-- Combined text search on subject and description
CREATE INDEX IF NOT EXISTS idx_tickets_fulltext 
    ON public.tickets USING gin(
        to_tsvector('english', COALESCE(subject, '') || ' ' || COALESCE(description, ''))
    );

-- ============================================
-- JSONB INDEXES FOR RFQ DATA
-- ============================================

-- GIN index for JSONB queries on rfq_data
CREATE INDEX IF NOT EXISTS idx_tickets_rfq_data 
    ON public.tickets USING gin(rfq_data jsonb_path_ops) 
    WHERE rfq_data IS NOT NULL;

-- Specific field indexes for common RFQ queries
CREATE INDEX IF NOT EXISTS idx_tickets_rfq_customer 
    ON public.tickets((rfq_data->>'customer_name')) 
    WHERE rfq_data IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_rfq_service_type 
    ON public.tickets((rfq_data->>'service_type')) 
    WHERE rfq_data IS NOT NULL;

-- ============================================
-- PARTIAL INDEXES FOR PERFORMANCE
-- ============================================

-- Index for open tickets only (most commonly queried)
CREATE INDEX IF NOT EXISTS idx_tickets_open_only 
    ON public.tickets(department_id, created_at DESC) 
    WHERE status = 'open';

-- Index for in-progress tickets
CREATE INDEX IF NOT EXISTS idx_tickets_in_progress_only 
    ON public.tickets(department_id, assigned_to, created_at DESC) 
    WHERE status = 'in_progress';

-- Index for unassigned tickets
CREATE INDEX IF NOT EXISTS idx_tickets_unassigned 
    ON public.tickets(department_id, created_at DESC) 
    WHERE assigned_to IS NULL AND status IN ('open', 'pending');

-- Index for high priority tickets
CREATE INDEX IF NOT EXISTS idx_tickets_high_priority 
    ON public.tickets(department_id, created_at DESC) 
    WHERE priority IN ('high', 'urgent') AND status NOT IN ('resolved', 'closed');

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================

ANALYZE public.roles;
ANALYZE public.departments;
ANALYZE public.users;
ANALYZE public.tickets;
ANALYZE public.ticket_assignments;
ANALYZE public.ticket_comments;
ANALYZE public.ticket_attachments;
ANALYZE public.rate_quotes;
ANALYZE public.sla_config;
ANALYZE public.sla_tracking;
ANALYZE public.audit_logs;
ANALYZE public.ticket_sequences;