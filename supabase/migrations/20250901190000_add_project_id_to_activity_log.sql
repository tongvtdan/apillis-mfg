-- Add project_id column to activity_log table for better project analytics
ALTER TABLE "public"."activity_log" 
ADD COLUMN IF NOT EXISTS "project_id" "uuid";

-- Add foreign key constraint to projects table
ALTER TABLE "public"."activity_log" 
ADD CONSTRAINT "activity_log_project_id_fkey" 
FOREIGN KEY ("project_id") 
REFERENCES "public"."projects"("id") 
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "activity_log_project_id_idx" 
ON "public"."activity_log" ("project_id");

-- Add comment for documentation
COMMENT ON COLUMN "public"."activity_log"."project_id" 
IS 'Optional reference to the project associated with this activity for analytics purposes';