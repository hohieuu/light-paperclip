CREATE TABLE "issue_brainstorming_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"plan_parts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"all_parts_approved" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issue_brainstorming_sessions" ADD CONSTRAINT "issue_brainstorming_sessions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_brainstorming_sessions" ADD CONSTRAINT "issue_brainstorming_sessions_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "issue_brainstorming_sessions_company_issue_uq" ON "issue_brainstorming_sessions" USING btree ("company_id","issue_id");--> statement-breakpoint
CREATE INDEX "issue_brainstorming_sessions_company_idx" ON "issue_brainstorming_sessions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "issue_brainstorming_sessions_issue_idx" ON "issue_brainstorming_sessions" USING btree ("issue_id");