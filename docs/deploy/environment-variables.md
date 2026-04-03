---
title: Environment Variables
summary: Full environment variable reference
---

All environment variables that Agilo uses for server configuration.

## Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3100` | Server port |
| `HOST` | `127.0.0.1` | Server host binding |
| `DATABASE_URL` | (embedded) | PostgreSQL connection string |
| `AGILO_HOME` | `~/.agilo` | Base directory for all Agilo data |
| `AGILO_INSTANCE_ID` | `default` | Instance identifier (for multiple local instances) |
| `AGILO_DEPLOYMENT_MODE` | `local_trusted` | Runtime mode override |

## Secrets

| Variable | Default | Description |
|----------|---------|-------------|
| `AGILO_SECRETS_MASTER_KEY` | (from file) | 32-byte encryption key (base64/hex/raw) |
| `AGILO_SECRETS_MASTER_KEY_FILE` | `~/.agilo/.../secrets/master.key` | Path to key file |
| `AGILO_SECRETS_STRICT_MODE` | `false` | Require secret refs for sensitive env vars |

## Agent Runtime (Injected into agent processes)

These are set automatically by the server when invoking agents:

| Variable | Description |
|----------|-------------|
| `AGILO_AGENT_ID` | Agent's unique ID |
| `AGILO_COMPANY_ID` | Company ID |
| `AGILO_API_URL` | Agilo API base URL |
| `AGILO_API_KEY` | Short-lived JWT for API auth |
| `AGILO_RUN_ID` | Current heartbeat run ID |
| `AGILO_TASK_ID` | Issue that triggered this wake |
| `AGILO_WAKE_REASON` | Wake trigger reason |
| `AGILO_WAKE_COMMENT_ID` | Comment that triggered this wake |
| `AGILO_APPROVAL_ID` | Resolved approval ID |
| `AGILO_APPROVAL_STATUS` | Approval decision |
| `AGILO_LINKED_ISSUE_IDS` | Comma-separated linked issue IDs |

## LLM Provider Keys (for adapters)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (for Claude Local adapter) |
| `OPENAI_API_KEY` | OpenAI API key (for Codex Local adapter) |
