-- ============================================
-- UGC_Ticketing Database Functions
-- Blueprint SSOT v1.0
-- ============================================

-- ============================================
-- TICKET CODE GENERATION FUNCTION
-- Format: [TYPE][DEPT]ddmmyyxxx
-- Examples: RFQDOM010226001, GENMKT150126002
-- Uses transaction-safe locking for sequence
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_ticket_code(
    p_ticket_type VARCHAR(10),
    p_department_code VARCHAR(10)
)
RETURNS VARCHAR(20) AS $$
DECLARE
    v_date_key VARCHAR(6);
    v_sequence INTEGER;
    v_ticket_code VARCHAR(20);
BEGIN
    -- Generate date key in ddmmyy format
    v_date_key := TO_CHAR(CURRENT_DATE, 'DDMMYY');
    
    -- Lock and get/increment sequence atomically
    INSERT INTO public.ticket_sequences (ticket_type, department_code, date_key, last_sequence)
    VALUES (p_ticket_type, p_department_code, v_date_key, 1)
    ON CONFLICT (ticket_type, department_code, date_key)
    DO UPDATE SET 
        last_sequence = public.ticket_sequences.last_sequence + 1,
        updated_at = NOW()
    RETURNING last_sequence INTO v_sequence;
    
    -- Generate ticket code: TYPE + DEPT + DDMMYY + XXX (3-digit sequence)
    v_ticket_code := p_ticket_type || p_department_code || v_date_key || LPAD(v_sequence::TEXT, 3, '0');
    
    RETURN v_ticket_code;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_ticket_code IS 'Generates unique ticket code with format [TYPE][DEPT]ddmmyyxxx';

-- ============================================
-- GENERATE QUOTE NUMBER FUNCTION
-- Format: QT-[TICKET_CODE]-XXX
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_quote_number(
    p_ticket_id UUID
)
RETURNS VARCHAR(30) AS $$
DECLARE
    v_ticket_code VARCHAR(20);
    v_quote_count INTEGER;
    v_quote_number VARCHAR(30);
BEGIN
    -- Get ticket code
    SELECT ticket_code INTO v_ticket_code
    FROM public.tickets
    WHERE id = p_ticket_id;
    
    IF v_ticket_code IS NULL THEN
        RAISE EXCEPTION 'Ticket not found: %', p_ticket_id;
    END IF;
    
    -- Count existing quotes for this ticket
    SELECT COUNT(*) + 1 INTO v_quote_count
    FROM public.rate_quotes
    WHERE ticket_id = p_ticket_id;
    
    -- Generate quote number
    v_quote_number := 'QT-' || v_ticket_code || '-' || LPAD(v_quote_count::TEXT, 3, '0');
    
    RETURN v_quote_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_quote_number IS 'Generates unique quote number based on ticket code';

-- ============================================
-- CREATE TICKET WITH AUTO-GENERATED CODE
-- Wrapper function for creating tickets with auto code
-- ============================================

CREATE OR REPLACE FUNCTION public.create_ticket(
    p_ticket_type VARCHAR(10),
    p_subject VARCHAR(255),
    p_description TEXT,
    p_department_id UUID,
    p_created_by UUID,
    p_priority VARCHAR(20) DEFAULT 'medium',
    p_rfq_data JSONB DEFAULT NULL
)
RETURNS public.tickets AS $$
DECLARE
    v_department_code VARCHAR(10);
    v_ticket_code VARCHAR(20);
    v_ticket public.tickets;
    v_sla_config public.sla_config;
BEGIN
    -- Get department code
    SELECT code INTO v_department_code
    FROM public.departments
    WHERE id = p_department_id;
    
    IF v_department_code IS NULL THEN
        RAISE EXCEPTION 'Department not found: %', p_department_id;
    END IF;
    
    -- Generate ticket code
    v_ticket_code := public.generate_ticket_code(p_ticket_type, v_department_code);
    
    -- Insert ticket
    INSERT INTO public.tickets (
        ticket_code,
        ticket_type,
        subject,
        description,
        department_id,
        created_by,
        priority,
        rfq_data,
        status
    ) VALUES (
        v_ticket_code,
        p_ticket_type,
        p_subject,
        p_description,
        p_department_id,
        p_created_by,
        p_priority,
        p_rfq_data,
        'open'
    ) RETURNING * INTO v_ticket;
    
    -- Get SLA config for this department and ticket type
    SELECT * INTO v_sla_config
    FROM public.sla_config
    WHERE department_id = p_department_id
    AND ticket_type = p_ticket_type;
    
    -- Create SLA tracking record
    IF v_sla_config IS NOT NULL THEN
        INSERT INTO public.sla_tracking (
            ticket_id,
            first_response_sla_hours,
            resolution_sla_hours
        ) VALUES (
            v_ticket.id,
            v_sla_config.first_response_hours,
            v_sla_config.resolution_hours
        );
    ELSE
        -- Use defaults if no config found
        INSERT INTO public.sla_tracking (
            ticket_id,
            first_response_sla_hours,
            resolution_sla_hours
        ) VALUES (
            v_ticket.id,
            24,  -- Default 24 hours first response
            72   -- Default 72 hours resolution
        );
    END IF;
    
    RETURN v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_ticket IS 'Creates a ticket with auto-generated code and SLA tracking';

-- ============================================
-- UPDATE SLA TRACKING FUNCTION
-- Called when first response or resolution occurs
-- ============================================

CREATE OR REPLACE FUNCTION public.update_sla_tracking(
    p_ticket_id UUID,
    p_event_type VARCHAR(20)  -- 'first_response' or 'resolution'
)
RETURNS public.sla_tracking AS $$
DECLARE
    v_sla public.sla_tracking;
    v_ticket public.tickets;
    v_hours_elapsed NUMERIC;
    v_met BOOLEAN;
BEGIN
    -- Get ticket info
    SELECT * INTO v_ticket
    FROM public.tickets
    WHERE id = p_ticket_id;
    
    IF v_ticket IS NULL THEN
        RAISE EXCEPTION 'Ticket not found: %', p_ticket_id;
    END IF;
    
    -- Get SLA tracking record
    SELECT * INTO v_sla
    FROM public.sla_tracking
    WHERE ticket_id = p_ticket_id;
    
    IF v_sla IS NULL THEN
        RAISE EXCEPTION 'SLA tracking not found for ticket: %', p_ticket_id;
    END IF;
    
    IF p_event_type = 'first_response' AND v_sla.first_response_at IS NULL THEN
        -- Calculate hours elapsed since ticket creation
        v_hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_ticket.created_at)) / 3600;
        v_met := v_hours_elapsed <= v_sla.first_response_sla_hours;
        
        UPDATE public.sla_tracking
        SET 
            first_response_at = NOW(),
            first_response_met = v_met,
            updated_at = NOW()
        WHERE ticket_id = p_ticket_id
        RETURNING * INTO v_sla;
        
    ELSIF p_event_type = 'resolution' AND v_sla.resolution_at IS NULL THEN
        -- Calculate hours elapsed since ticket creation
        v_hours_elapsed := EXTRACT(EPOCH FROM (NOW() - v_ticket.created_at)) / 3600;
        v_met := v_hours_elapsed <= v_sla.resolution_sla_hours;
        
        UPDATE public.sla_tracking
        SET 
            resolution_at = NOW(),
            resolution_met = v_met,
            updated_at = NOW()
        WHERE ticket_id = p_ticket_id
        RETURNING * INTO v_sla;
        
        -- Also update ticket resolved_at
        UPDATE public.tickets
        SET resolved_at = NOW()
        WHERE id = p_ticket_id;
    END IF;
    
    RETURN v_sla;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_sla_tracking IS 'Updates SLA tracking for first response or resolution events';

-- ============================================
-- ASSIGN TICKET FUNCTION
-- Handles ticket assignment with history tracking
-- ============================================

CREATE OR REPLACE FUNCTION public.assign_ticket(
    p_ticket_id UUID,
    p_assigned_to UUID,
    p_assigned_by UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS public.tickets AS $$
DECLARE
    v_ticket public.tickets;
BEGIN
    -- Update ticket
    UPDATE public.tickets
    SET 
        assigned_to = p_assigned_to,
        status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END,
        updated_at = NOW()
    WHERE id = p_ticket_id
    RETURNING * INTO v_ticket;
    
    IF v_ticket IS NULL THEN
        RAISE EXCEPTION 'Ticket not found: %', p_ticket_id;
    END IF;
    
    -- Record assignment history
    INSERT INTO public.ticket_assignments (
        ticket_id,
        assigned_to,
        assigned_by,
        notes
    ) VALUES (
        p_ticket_id,
        p_assigned_to,
        p_assigned_by,
        p_notes
    );
    
    -- Update SLA first response if this is the first assignment
    PERFORM public.update_sla_tracking(p_ticket_id, 'first_response');
    
    RETURN v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.assign_ticket IS 'Assigns ticket to user and records assignment history';

-- ============================================
-- CLOSE TICKET FUNCTION
-- Handles ticket closure with SLA tracking
-- ============================================

CREATE OR REPLACE FUNCTION public.close_ticket(
    p_ticket_id UUID,
    p_status VARCHAR(20) DEFAULT 'closed'
)
RETURNS public.tickets AS $$
DECLARE
    v_ticket public.tickets;
BEGIN
    -- Validate status
    IF p_status NOT IN ('resolved', 'closed') THEN
        RAISE EXCEPTION 'Invalid close status: %. Must be resolved or closed.', p_status;
    END IF;
    
    -- Update ticket
    UPDATE public.tickets
    SET 
        status = p_status,
        closed_at = CASE WHEN p_status = 'closed' THEN NOW() ELSE closed_at END,
        resolved_at = CASE WHEN p_status = 'resolved' AND resolved_at IS NULL THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
    WHERE id = p_ticket_id
    RETURNING * INTO v_ticket;
    
    IF v_ticket IS NULL THEN
        RAISE EXCEPTION 'Ticket not found: %', p_ticket_id;
    END IF;
    
    -- Update SLA resolution tracking
    IF p_status IN ('resolved', 'closed') THEN
        PERFORM public.update_sla_tracking(p_ticket_id, 'resolution');
    END IF;
    
    RETURN v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.close_ticket IS 'Closes or resolves a ticket with SLA tracking';

-- ============================================
-- CREATE AUDIT LOG FUNCTION
-- Generic function to create audit log entries
-- ============================================

CREATE OR REPLACE FUNCTION public.create_audit_log(
    p_table_name VARCHAR(50),
    p_record_id UUID,
    p_action VARCHAR(20),
    p_old_data JSONB,
    p_new_data JSONB,
    p_user_id UUID,
    p_ip_address VARCHAR(45) DEFAULT NULL
)
RETURNS public.audit_logs AS $$
DECLARE
    v_audit public.audit_logs;
BEGIN
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id,
        ip_address
    ) VALUES (
        p_table_name,
        p_record_id,
        p_action,
        p_old_data,
        p_new_data,
        p_user_id,
        p_ip_address
    ) RETURNING * INTO v_audit;
    
    RETURN v_audit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_audit_log IS 'Creates an audit log entry';

-- ============================================
-- AUDIT TRIGGER FUNCTION
-- Automatically logs changes to tickets table
-- ============================================

CREATE OR REPLACE FUNCTION public.audit_ticket_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_action VARCHAR(20);
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    -- Get current user from auth context
    v_user_id := auth.uid();
    
    -- If no auth context, try to get from NEW/OLD record
    IF v_user_id IS NULL THEN
        IF TG_OP = 'DELETE' THEN
            v_user_id := OLD.created_by;
        ELSE
            v_user_id := NEW.created_by;
        END IF;
    END IF;
    
    -- Determine action
    v_action := LOWER(TG_OP);
    
    -- Set old/new data
    IF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        v_old_data := NULL;
        v_new_data := to_jsonb(NEW);
    ELSE -- UPDATE
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    END IF;
    
    -- Only log if user_id is available
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.audit_logs (
            table_name,
            record_id,
            action,
            old_data,
            new_data,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            v_action,
            v_old_data,
            v_new_data,
            v_user_id
        );
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to tickets table
DROP TRIGGER IF EXISTS audit_tickets_trigger ON public.tickets;
CREATE TRIGGER audit_tickets_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_ticket_changes();

-- ============================================
-- GET DASHBOARD SUMMARY FUNCTION
-- Returns aggregated metrics for dashboard
-- ============================================

CREATE OR REPLACE FUNCTION public.get_dashboard_summary(
    p_user_id UUID,
    p_department_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_role_name TEXT;
    v_user_dept UUID;
    v_result JSONB;
    v_total INTEGER;
    v_open INTEGER;
    v_in_progress INTEGER;
    v_pending INTEGER;
    v_resolved INTEGER;
    v_closed INTEGER;
    v_by_department JSONB;
    v_by_status JSONB;
BEGIN
    -- Get user role and department
    v_role_name := public.get_user_role(p_user_id);
    v_user_dept := COALESCE(p_department_id, public.get_user_department(p_user_id));
    
    -- Build base query based on role
    IF v_role_name = 'super_admin' THEN
        -- Super admin sees all
        SELECT COUNT(*) INTO v_total FROM public.tickets;
        SELECT COUNT(*) INTO v_open FROM public.tickets WHERE status = 'open';
        SELECT COUNT(*) INTO v_in_progress FROM public.tickets WHERE status = 'in_progress';
        SELECT COUNT(*) INTO v_pending FROM public.tickets WHERE status = 'pending';
        SELECT COUNT(*) INTO v_resolved FROM public.tickets WHERE status = 'resolved';
        SELECT COUNT(*) INTO v_closed FROM public.tickets WHERE status = 'closed';
        
        -- By department
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_by_department
        FROM (
            SELECT d.name as department, COUNT(t.id) as count
            FROM public.departments d
            LEFT JOIN public.tickets t ON t.department_id = d.id
            GROUP BY d.id, d.name
            ORDER BY count DESC
        ) t;
        
    ELSIF v_role_name IN ('marketing_manager', 'sales_manager', 'domestics_ops_manager', 
                          'exim_ops_manager', 'import_dtd_ops_manager', 'warehouse_traffic_ops_manager') THEN
        -- Managers see department tickets
        SELECT COUNT(*) INTO v_total FROM public.tickets WHERE department_id = v_user_dept;
        SELECT COUNT(*) INTO v_open FROM public.tickets WHERE department_id = v_user_dept AND status = 'open';
        SELECT COUNT(*) INTO v_in_progress FROM public.tickets WHERE department_id = v_user_dept AND status = 'in_progress';
        SELECT COUNT(*) INTO v_pending FROM public.tickets WHERE department_id = v_user_dept AND status = 'pending';
        SELECT COUNT(*) INTO v_resolved FROM public.tickets WHERE department_id = v_user_dept AND status = 'resolved';
        SELECT COUNT(*) INTO v_closed FROM public.tickets WHERE department_id = v_user_dept AND status = 'closed';
        
        v_by_department := '[]'::jsonb;
        
    ELSE
        -- Staff sees own tickets
        SELECT COUNT(*) INTO v_total FROM public.tickets WHERE created_by = p_user_id OR assigned_to = p_user_id;
        SELECT COUNT(*) INTO v_open FROM public.tickets WHERE (created_by = p_user_id OR assigned_to = p_user_id) AND status = 'open';
        SELECT COUNT(*) INTO v_in_progress FROM public.tickets WHERE (created_by = p_user_id OR assigned_to = p_user_id) AND status = 'in_progress';
        SELECT COUNT(*) INTO v_pending FROM public.tickets WHERE (created_by = p_user_id OR assigned_to = p_user_id) AND status = 'pending';
        SELECT COUNT(*) INTO v_resolved FROM public.tickets WHERE (created_by = p_user_id OR assigned_to = p_user_id) AND status = 'resolved';
        SELECT COUNT(*) INTO v_closed FROM public.tickets WHERE (created_by = p_user_id OR assigned_to = p_user_id) AND status = 'closed';
        
        v_by_department := '[]'::jsonb;
    END IF;
    
    -- Build by status
    v_by_status := jsonb_build_array(
        jsonb_build_object('status', 'open', 'count', v_open),
        jsonb_build_object('status', 'in_progress', 'count', v_in_progress),
        jsonb_build_object('status', 'pending', 'count', v_pending),
        jsonb_build_object('status', 'resolved', 'count', v_resolved),
        jsonb_build_object('status', 'closed', 'count', v_closed)
    );
    
    -- Build result
    v_result := jsonb_build_object(
        'total_tickets', v_total,
        'open_tickets', v_open,
        'in_progress_tickets', v_in_progress,
        'pending_tickets', v_pending,
        'resolved_tickets', v_resolved,
        'closed_tickets', v_closed,
        'tickets_by_department', v_by_department,
        'tickets_by_status', v_by_status
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_dashboard_summary IS 'Returns dashboard summary metrics based on user role';

-- ============================================
-- GET SLA METRICS FUNCTION
-- Returns SLA performance metrics by department
-- ============================================

CREATE OR REPLACE FUNCTION public.get_sla_metrics(
    p_user_id UUID,
    p_department_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    v_role_name TEXT;
    v_user_dept UUID;
    v_result JSONB;
    v_start_date TIMESTAMPTZ;
BEGIN
    -- Get user role and department
    v_role_name := public.get_user_role(p_user_id);
    v_user_dept := COALESCE(p_department_id, public.get_user_department(p_user_id));
    v_start_date := NOW() - (p_days || ' days')::INTERVAL;
    
    IF v_role_name = 'super_admin' THEN
        -- Super admin sees all departments
        SELECT COALESCE(jsonb_agg(metrics), '[]'::jsonb) INTO v_result
        FROM (
            SELECT 
                d.name as department,
                d.code as department_code,
                COUNT(t.id) as total_tickets,
                ROUND(AVG(EXTRACT(EPOCH FROM (st.first_response_at - t.created_at)) / 3600)::numeric, 2) as first_response_avg_hours,
                ROUND((COUNT(CASE WHEN st.first_response_met = TRUE THEN 1 END)::numeric / NULLIF(COUNT(st.first_response_met), 0) * 100)::numeric, 2) as first_response_compliance,
                ROUND(AVG(EXTRACT(EPOCH FROM (st.resolution_at - t.created_at)) / 3600)::numeric, 2) as resolution_avg_hours,
                ROUND((COUNT(CASE WHEN st.resolution_met = TRUE THEN 1 END)::numeric / NULLIF(COUNT(st.resolution_met), 0) * 100)::numeric, 2) as resolution_compliance
            FROM public.departments d
            LEFT JOIN public.tickets t ON t.department_id = d.id AND t.created_at >= v_start_date
            LEFT JOIN public.sla_tracking st ON st.ticket_id = t.id
            GROUP BY d.id, d.name, d.code
            ORDER BY d.name
        ) metrics;
    ELSE
        -- Others see their department only
        SELECT COALESCE(jsonb_agg(metrics), '[]'::jsonb) INTO v_result
        FROM (
            SELECT 
                d.name as department,
                d.code as department_code,
                COUNT(t.id) as total_tickets,
                ROUND(AVG(EXTRACT(EPOCH FROM (st.first_response_at - t.created_at)) / 3600)::numeric, 2) as first_response_avg_hours,
                ROUND((COUNT(CASE WHEN st.first_response_met = TRUE THEN 1 END)::numeric / NULLIF(COUNT(st.first_response_met), 0) * 100)::numeric, 2) as first_response_compliance,
                ROUND(AVG(EXTRACT(EPOCH FROM (st.resolution_at - t.created_at)) / 3600)::numeric, 2) as resolution_avg_hours,
                ROUND((COUNT(CASE WHEN st.resolution_met = TRUE THEN 1 END)::numeric / NULLIF(COUNT(st.resolution_met), 0) * 100)::numeric, 2) as resolution_compliance
            FROM public.departments d
            LEFT JOIN public.tickets t ON t.department_id = d.id AND t.created_at >= v_start_date
            LEFT JOIN public.sla_tracking st ON st.ticket_id = t.id
            WHERE d.id = v_user_dept
            GROUP BY d.id, d.name, d.code
        ) metrics;
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_sla_metrics IS 'Returns SLA performance metrics by department';

-- ============================================
-- CALCULATE VOLUME FUNCTION
-- For RFQ auto-calculation
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_volume(
    p_length NUMERIC,
    p_width NUMERIC,
    p_height NUMERIC,
    p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
    v_volume_per_unit NUMERIC;
    v_total_volume NUMERIC;
BEGIN
    -- Convert cm to m and calculate CBM (Cubic Meters)
    v_volume_per_unit := (p_length / 100) * (p_width / 100) * (p_height / 100);
    v_total_volume := v_volume_per_unit * p_quantity;
    
    RETURN jsonb_build_object(
        'volume_per_unit', ROUND(v_volume_per_unit, 6),
        'total_volume', ROUND(v_total_volume, 6)
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.calculate_volume IS 'Calculates volume per unit and total volume in CBM';

-- ============================================
-- USER CREATION HOOK
-- Automatically creates user profile when auth user is created
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_default_role_id UUID;
BEGIN
    -- Get default role (salesperson as safest default)
    SELECT id INTO v_default_role_id
    FROM public.roles
    WHERE name = 'salesperson'
    LIMIT 1;
    
    -- If no salesperson role, get any role
    IF v_default_role_id IS NULL THEN
        SELECT id INTO v_default_role_id
        FROM public.roles
        LIMIT 1;
    END IF;
    
    -- Insert user profile
    INSERT INTO public.users (id, email, full_name, role_id, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        v_default_role_id,
        TRUE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- GRANT EXECUTE PERMISSIONS ON FUNCTIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.generate_ticket_code(VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_quote_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_ticket(VARCHAR, VARCHAR, TEXT, UUID, UUID, VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_sla_tracking(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_ticket(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_ticket(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_audit_log(VARCHAR, UUID, VARCHAR, JSONB, JSONB, UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sla_metrics(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_volume(NUMERIC, NUMERIC, NUMERIC, INTEGER) TO authenticated;