-- Rename activities table to user_dashboard_activities
-- Created: December 13, 2024
-- Purpose: Clarify distinction between user-facing activities and system activity logs

-- Rename the table
ALTER TABLE IF EXISTS public.activities RENAME TO user_dashboard_activities;

-- Rename indexes
ALTER INDEX IF EXISTS idx_activities_user_id RENAME TO idx_user_dashboard_activities_user_id;
ALTER INDEX IF EXISTS idx_activities_activity_type RENAME TO idx_user_dashboard_activities_activity_type;
ALTER INDEX IF EXISTS idx_activities_created_at RENAME TO idx_user_dashboard_activities_created_at;
