CREATE TABLE IF NOT EXISTS "model_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"tier" text DEFAULT 'standard' NOT NULL,
	"capabilities" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"input_cost_per_million_tokens" integer DEFAULT 0 NOT NULL,
	"output_cost_per_million_tokens" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE IF EXISTS "routine_runs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "routine_triggers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE IF EXISTS "routines" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE IF EXISTS "routine_runs" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "routine_triggers" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "routines" CASCADE;--> statement-breakpoint
ALTER TABLE "issues" DROP CONSTRAINT IF EXISTS "issues_goal_id_goals_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "issues_open_routine_execution_uq";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "model_profile_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_profiles_provider_idx" ON "model_profiles" USING btree ("provider");--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agents_model_profile_id_model_profiles_id_fk') THEN
  ALTER TABLE "agents" ADD CONSTRAINT "agents_model_profile_id_model_profiles_id_fk" FOREIGN KEY ("model_profile_id") REFERENCES "public"."model_profiles"("id") ON DELETE set null ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
ALTER TABLE "companies" DROP COLUMN IF EXISTS "require_board_approval_for_new_agents";--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN IF EXISTS "goal_id";