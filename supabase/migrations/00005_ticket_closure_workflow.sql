-- Migration: Add ticket closure workflow fields
-- Date: 2026-01-03

-- Add new columns for ticket closure workflow
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS close_outcome VARCHAR(10),
ADD COLUMN IF NOT EXISTS close_reason TEXT,
ADD COLUMN IF NOT EXISTS competitor_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS competitor_cost DECIMAL(15, 2);

-- Add check constraint for close_outcome
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_close_outcome_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_close_outcome_check 
CHECK (close_outcome IS NULL OR close_outcome IN ('won', 'lost'));

-- Update status constraint to include new statuses
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check 
CHECK (status IN ('open', 'need_response', 'in_progress', 'waiting_customer', 'need_adjustment', 'resolved', 'closed'));

-- Add index for close_outcome for dashboard queries
CREATE INDEX IF NOT EXISTS idx_tickets_close_outcome ON tickets(close_outcome) WHERE close_outcome IS NOT NULL;

-- Add index for new statuses
CREATE INDEX IF NOT EXISTS idx_tickets_status_workflow ON tickets(status, created_by, department_id);

-- Comments for documentation
COMMENT ON COLUMN tickets.close_outcome IS 'Outcome when ticket is closed: won or lost';
COMMENT ON COLUMN tickets.close_reason IS 'Reason for closing, required when lost';
COMMENT ON COLUMN tickets.competitor_name IS 'Competitor name if lost due to competition';
COMMENT ON COLUMN tickets.competitor_cost IS 'Competitor price if lost due to price';
