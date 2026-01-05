-- Create activity_log and error_log tables matching n8n schema exactly
-- Created: December 13, 2024
-- Purpose: Centralize all data including n8n logs in one database
-- Schema matches: r2m_db1.activity_log and r2m_db1.error_log from n8n

-- Activity Log Table (matching n8n schema exactly)
CREATE TABLE IF NOT EXISTS public.activity_log (
    activity_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id TEXT,
    workflow_id TEXT,
    status TEXT DEFAULT 'success',
    details TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Error Log Table (matching n8n schema exactly)
CREATE TABLE IF NOT EXISTS public.error_log (
    error_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name TEXT NOT NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id TEXT,
    workflow_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity_log (matching n8n schema)
CREATE INDEX IF NOT EXISTS idx_activity_log_workflow_name ON public.activity_log USING btree (workflow_name);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log USING btree (action);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_workflow_id ON public.activity_log USING btree (workflow_id);

-- Create indexes for error_log (matching n8n schema)
CREATE INDEX IF NOT EXISTS idx_error_log_workflow_name ON public.error_log USING btree (workflow_name);
CREATE INDEX IF NOT EXISTS idx_error_log_error_type ON public.error_log USING btree (error_type);
CREATE INDEX IF NOT EXISTS idx_error_log_user_id ON public.error_log USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_error_log_created_at ON public.error_log USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_log_workflow_id ON public.error_log USING btree (workflow_id);

-- Disable RLS for now (same as other tables)
ALTER TABLE public.activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_log DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON public.activity_log TO anon, authenticated;
GRANT ALL ON public.error_log TO anon, authenticated;
