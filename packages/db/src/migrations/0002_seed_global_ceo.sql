INSERT INTO "agents" ("id", "company_id", "name", "role", "title", "status", "adapter_type", "adapter_config", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'Orchestrator',
  'ceo',
  'Orchestrator',
  'idle',
  'claude_local',
  '{}'::jsonb,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM "agents" WHERE "company_id" = '00000000-0000-0000-0000-000000000000' AND "role" = 'ceo'
);
