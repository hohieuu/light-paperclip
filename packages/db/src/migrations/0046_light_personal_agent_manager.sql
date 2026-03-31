-- Light Paperclip Refactor: Remove governance, add model profiles
-- Removes goal chains, simplifies approvals, adds provider-agnostic model profiles

-- 1. Remove goal_id FK from issues (drop constraint, then column)
ALTER TABLE "issues" DROP CONSTRAINT IF EXISTS "issues_goal_id_goals_id_fk";
ALTER TABLE "issues" DROP COLUMN IF EXISTS "goal_id";

-- 2. Drop project_goals junction table (no other FK refs)
DROP TABLE IF EXISTS "project_goals" CASCADE;

-- 3. Drop goals table (FK to agents/companies, safe to drop after project_goals)
DROP TABLE IF EXISTS "goals" CASCADE;

-- 4. Remove board-approval flag from companies
ALTER TABLE "companies" DROP COLUMN IF EXISTS "require_board_approval_for_new_agents";

-- 5. Create model_profiles table (provider-agnostic LLM model definitions)
CREATE TABLE IF NOT EXISTS "model_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "provider" text NOT NULL,
  "tier" text NOT NULL DEFAULT 'standard',
  "capabilities" jsonb NOT NULL DEFAULT '{}',
  "input_cost_per_million_tokens" integer NOT NULL DEFAULT 0,
  "output_cost_per_million_tokens" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "model_profiles_provider_idx" ON "model_profiles" ("provider");

-- 6. Add model_profile_id to agents (nullable — agent can work without a profile)
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "model_profile_id" uuid;
ALTER TABLE "agents" ADD CONSTRAINT "agents_model_profile_id_model_profiles_id_fk"
  FOREIGN KEY ("model_profile_id") REFERENCES "model_profiles"("id") ON DELETE SET NULL;

-- 7. Add index for agent model lookup
CREATE INDEX IF NOT EXISTS "agents_model_profile_idx" ON "agents" ("model_profile_id");
