INSERT INTO "companies" ("id", "name", "status", "issue_prefix", "issue_counter", "budget_monthly_cents", "spent_monthly_cents", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000000', 'Global', 'active', 'PAP', 0, 0, 0, now(), now())
ON CONFLICT ("id") DO NOTHING;
