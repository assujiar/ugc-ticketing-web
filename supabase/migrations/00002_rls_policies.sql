-- ============================================
-- UGC_Ticketing Row Level Security (RLS) Policies
-- Blueprint SSOT v1.0
-- 
-- RLS Principles from Blueprint:
-- - Super Admin: Unrestricted access to all data
-- - Managers: Access to own department + cross-department updates
-- - Staff/Salesperson: Access to own tickets only
-- ============================================

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Get current user's role name
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    role_name TEXT;
BEGIN
    SELECT r.name INTO role_name
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = user_id AND u.is_active = TRUE;
    
    RETURN role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's department ID
CREATE OR REPLACE FUNCTION public.get_user_department(user_id UUID)
RETURNS UUID AS $$
DECLARE
    dept_id UUID;
BEGIN
    SELECT u.department_id INTO dept_id
    FROM public.users u
    WHERE u.id = user_id AND u.is_active = TRUE;
    
    RETURN dept_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_user_role(user_id) = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is a manager (can assign tickets and create quotes)
CREATE OR REPLACE FUNCTION public.is_manager(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    role_name TEXT;
BEGIN
    role_name := public.get_user_role(user_id);
    RETURN role_name IN (
        'super_admin',
        'marketing_manager',
        'sales_manager',
        'domestics_ops_manager',
        'exim_ops_manager',
        'import_dtd_ops_manager',
        'warehouse_traffic_ops_manager'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is staff (limited permissions)
CREATE OR REPLACE FUNCTION public.is_staff(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    role_name TEXT;
BEGIN
    role_name := public.get_user_role(user_id);
    RETURN role_name IN ('marketing_staff', 'salesperson');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_sequences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROLES TABLE POLICIES
-- Read-only for all authenticated users
-- ============================================
DROP POLICY IF EXISTS "roles_select_all" ON public.roles;
CREATE POLICY "roles_select_all" ON public.roles
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- ============================================
-- DEPARTMENTS TABLE POLICIES
-- Read-only for all authenticated users
-- ============================================
DROP POLICY IF EXISTS "departments_select_all" ON public.departments;
CREATE POLICY "departments_select_all" ON public.departments
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- SELECT: Super admin sees all, managers see dept, staff sees self
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT
    TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR (
            public.is_manager(auth.uid())
            AND (
                department_id = public.get_user_department(auth.uid())
                OR department_id IS NULL
            )
        )
        OR id = auth.uid()
    );

-- INSERT: Super admin only
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_super_admin(auth.uid()));

-- UPDATE: Super admin can update all, users can update self (limited)
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR id = auth.uid()
    )
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR id = auth.uid()
    );

-- DELETE: Super admin only
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;
CREATE POLICY "users_delete_policy" ON public.users
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- ============================================
-- TICKETS TABLE POLICIES
-- Based on RBAC Matrix from Blueprint
-- ============================================

-- SELECT: Based on role visibility rules
-- Super Admin: All tickets
-- Managers: Department tickets
-- Staff/Salesperson: Own tickets only
DROP POLICY IF EXISTS "tickets_select_policy" ON public.tickets;
CREATE POLICY "tickets_select_policy" ON public.tickets
    FOR SELECT
    TO authenticated
    USING (
        -- Super admin sees all
        public.is_super_admin(auth.uid())
        OR (
            -- Managers see department tickets
            public.is_manager(auth.uid())
            AND department_id = public.get_user_department(auth.uid())
        )
        OR (
            -- Staff sees own created or assigned tickets
            public.is_staff(auth.uid())
            AND (created_by = auth.uid() OR assigned_to = auth.uid())
        )
    );

-- INSERT: All authenticated users can create tickets
DROP POLICY IF EXISTS "tickets_insert_policy" ON public.tickets;
CREATE POLICY "tickets_insert_policy" ON public.tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.uid()
    );

-- UPDATE: Owner, super admin, or department manager
DROP POLICY IF EXISTS "tickets_update_policy" ON public.tickets;
CREATE POLICY "tickets_update_policy" ON public.tickets
    FOR UPDATE
    TO authenticated
    USING (
        -- Super admin can update all
        public.is_super_admin(auth.uid())
        OR (
            -- Manager can update department tickets
            public.is_manager(auth.uid())
            AND department_id = public.get_user_department(auth.uid())
        )
        OR (
            -- Owner can update own ticket
            created_by = auth.uid()
        )
    )
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR (
            public.is_manager(auth.uid())
            AND department_id = public.get_user_department(auth.uid())
        )
        OR created_by = auth.uid()
    );

-- DELETE: Owner, super admin, or department manager
DROP POLICY IF EXISTS "tickets_delete_policy" ON public.tickets;
CREATE POLICY "tickets_delete_policy" ON public.tickets
    FOR DELETE
    TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR (
            public.is_manager(auth.uid())
            AND department_id = public.get_user_department(auth.uid())
        )
        OR created_by = auth.uid()
    );

-- ============================================
-- TICKET_ASSIGNMENTS TABLE POLICIES
-- Only managers and super admin can assign
-- ============================================

-- SELECT: See assignments for tickets you can see
DROP POLICY IF EXISTS "ticket_assignments_select_policy" ON public.ticket_assignments;
CREATE POLICY "ticket_assignments_select_policy" ON public.ticket_assignments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                public.is_super_admin(auth.uid())
                OR (
                    public.is_manager(auth.uid())
                    AND t.department_id = public.get_user_department(auth.uid())
                )
                OR t.created_by = auth.uid()
                OR t.assigned_to = auth.uid()
            )
        )
    );

-- INSERT: Only managers and super admin can assign
DROP POLICY IF EXISTS "ticket_assignments_insert_policy" ON public.ticket_assignments;
CREATE POLICY "ticket_assignments_insert_policy" ON public.ticket_assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        assigned_by = auth.uid()
        AND (
            public.is_super_admin(auth.uid())
            OR public.is_manager(auth.uid())
        )
        AND EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                public.is_super_admin(auth.uid())
                OR t.department_id = public.get_user_department(auth.uid())
            )
        )
    );

-- ============================================
-- TICKET_COMMENTS TABLE POLICIES
-- ============================================

-- SELECT: See comments for tickets you can see
DROP POLICY IF EXISTS "ticket_comments_select_policy" ON public.ticket_comments;
CREATE POLICY "ticket_comments_select_policy" ON public.ticket_comments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                public.is_super_admin(auth.uid())
                OR (
                    public.is_manager(auth.uid())
                    AND t.department_id = public.get_user_department(auth.uid())
                )
                OR t.created_by = auth.uid()
                OR t.assigned_to = auth.uid()
            )
        )
        -- Hide internal comments from non-managers
        AND (
            is_internal = FALSE
            OR public.is_manager(auth.uid())
            OR public.is_super_admin(auth.uid())
        )
    );

-- INSERT: Users can comment on tickets they can see
DROP POLICY IF EXISTS "ticket_comments_insert_policy" ON public.ticket_comments;
CREATE POLICY "ticket_comments_insert_policy" ON public.ticket_comments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                public.is_super_admin(auth.uid())
                OR (
                    public.is_manager(auth.uid())
                    AND t.department_id = public.get_user_department(auth.uid())
                )
                OR t.created_by = auth.uid()
                OR t.assigned_to = auth.uid()
            )
        )
        -- Only managers can create internal comments
        AND (
            is_internal = FALSE
            OR public.is_manager(auth.uid())
            OR public.is_super_admin(auth.uid())
        )
    );

-- UPDATE: Users can update their own comments
DROP POLICY IF EXISTS "ticket_comments_update_policy" ON public.ticket_comments;
CREATE POLICY "ticket_comments_update_policy" ON public.ticket_comments
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()))
    WITH CHECK (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- DELETE: Users can delete their own comments, super admin can delete all
DROP POLICY IF EXISTS "ticket_comments_delete_policy" ON public.ticket_comments;
CREATE POLICY "ticket_comments_delete_policy" ON public.ticket_comments
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- ============================================
-- TICKET_ATTACHMENTS TABLE POLICIES
-- ============================================

-- SELECT: See attachments for tickets you can see
DROP POLICY IF EXISTS "ticket_attachments_select_policy" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_select_policy" ON public.ticket_attachments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                public.is_super_admin(auth.uid())
                OR (
                    public.is_manager(auth.uid())
                    AND t.department_id = public.get_user_department(auth.uid())
                )
                OR t.created_by = auth.uid()
                OR t.assigned_to = auth.uid()
            )
        )
    );

-- INSERT: Users can upload to tickets they can access
DROP POLICY IF EXISTS "ticket_attachments_insert_policy" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_insert_policy" ON public.ticket_attachments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        uploaded_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                public.is_super_admin(auth.uid())
                OR (
                    public.is_manager(auth.uid())
                    AND t.department_id = public.get_user_department(auth.uid())
                )
                OR t.created_by = auth.uid()
                OR t.assigned_to = auth.uid()
            )
        )
    );

-- DELETE: Uploader or super admin can delete
DROP POLICY IF EXISTS "ticket_attachments_delete_policy" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_delete_policy" ON public.ticket_attachments
    FOR DELETE
    TO authenticated
    USING (uploaded_by = auth.uid() OR public.is_super_admin(auth.uid()));

-- ============================================
-- RATE_QUOTES TABLE POLICIES
-- Only managers and super admin can create quotes
-- ============================================

-- SELECT: See quotes for tickets you can see
DROP POLICY IF EXISTS "rate_quotes_select_policy" ON public.rate_quotes;
CREATE POLICY "rate_quotes_select_policy" ON public.rate_quotes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                public.is_super_admin(auth.uid())
                OR (
                    public.is_manager(auth.uid())
                    AND t.department_id = public.get_user_department(auth.uid())
                )
                OR t.created_by = auth.uid()
                OR t.assigned_to = auth.uid()
            )
        )
    );

-- INSERT: Only managers and super admin can create quotes
DROP POLICY IF EXISTS "rate_quotes_insert_policy" ON public.rate_quotes;
CREATE POLICY "rate_quotes_insert_policy" ON public.rate_quotes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.uid()
        AND (
            public.is_super_admin(auth.uid())
            OR public.is_manager(auth.uid())
        )
        AND EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                public.is_super_admin(auth.uid())
                OR t.department_id = public.get_user_department(auth.uid())
            )
        )
    );

-- UPDATE: Creator or super admin can update
DROP POLICY IF EXISTS "rate_quotes_update_policy" ON public.rate_quotes;
CREATE POLICY "rate_quotes_update_policy" ON public.rate_quotes
    FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR public.is_super_admin(auth.uid())
    )
    WITH CHECK (
        created_by = auth.uid()
        OR public.is_super_admin(auth.uid())
    );

-- DELETE: Creator or super admin can delete
DROP POLICY IF EXISTS "rate_quotes_delete_policy" ON public.rate_quotes;
CREATE POLICY "rate_quotes_delete_policy" ON public.rate_quotes
    FOR DELETE
    TO authenticated
    USING (created_by = auth.uid() OR public.is_super_admin(auth.uid()));

-- ============================================
-- SLA_CONFIG TABLE POLICIES
-- Read for all, write for super admin only
-- ============================================

-- SELECT: All authenticated users can read SLA config
DROP POLICY IF EXISTS "sla_config_select_policy" ON public.sla_config;
CREATE POLICY "sla_config_select_policy" ON public.sla_config
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- INSERT/UPDATE/DELETE: Super admin only
DROP POLICY IF EXISTS "sla_config_insert_policy" ON public.sla_config;
CREATE POLICY "sla_config_insert_policy" ON public.sla_config
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "sla_config_update_policy" ON public.sla_config;
CREATE POLICY "sla_config_update_policy" ON public.sla_config
    FOR UPDATE
    TO authenticated
    USING (public.is_super_admin(auth.uid()))
    WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "sla_config_delete_policy" ON public.sla_config;
CREATE POLICY "sla_config_delete_policy" ON public.sla_config
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- ============================================
-- SLA_TRACKING TABLE POLICIES
-- Based on ticket access
-- ============================================

-- SELECT: See SLA for tickets you can see
DROP POLICY IF EXISTS "sla_tracking_select_policy" ON public.sla_tracking;
CREATE POLICY "sla_tracking_select_policy" ON public.sla_tracking
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                public.is_super_admin(auth.uid())
                OR (
                    public.is_manager(auth.uid())
                    AND t.department_id = public.get_user_department(auth.uid())
                )
                OR t.created_by = auth.uid()
                OR t.assigned_to = auth.uid()
            )
        )
    );

-- INSERT/UPDATE: System operations (service role) or super admin
DROP POLICY IF EXISTS "sla_tracking_insert_policy" ON public.sla_tracking;
CREATE POLICY "sla_tracking_insert_policy" ON public.sla_tracking
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR public.is_manager(auth.uid())
    );

DROP POLICY IF EXISTS "sla_tracking_update_policy" ON public.sla_tracking;
CREATE POLICY "sla_tracking_update_policy" ON public.sla_tracking
    FOR UPDATE
    TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_manager(auth.uid())
    )
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR public.is_manager(auth.uid())
    );

-- ============================================
-- AUDIT_LOGS TABLE POLICIES
-- Append-only: Insert for all, read for managers/admin
-- ============================================

-- SELECT: Managers and super admin can read
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_manager(auth.uid())
    );

-- INSERT: All authenticated users can create audit logs
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- No UPDATE or DELETE - audit logs are append-only

-- ============================================
-- TICKET_SEQUENCES TABLE POLICIES
-- System use only, but allow authenticated for ticket creation
-- ============================================

DROP POLICY IF EXISTS "ticket_sequences_select_policy" ON public.ticket_sequences;
CREATE POLICY "ticket_sequences_select_policy" ON public.ticket_sequences
    FOR SELECT
    TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "ticket_sequences_insert_policy" ON public.ticket_sequences;
CREATE POLICY "ticket_sequences_insert_policy" ON public.ticket_sequences
    FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "ticket_sequences_update_policy" ON public.ticket_sequences;
CREATE POLICY "ticket_sequences_update_policy" ON public.ticket_sequences
    FOR UPDATE
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables to authenticated users
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.departments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tickets TO authenticated;
GRANT SELECT, INSERT ON public.ticket_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.ticket_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sla_config TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.sla_tracking TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ticket_sequences TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_department(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated;