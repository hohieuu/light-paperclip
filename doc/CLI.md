# CLI Reference

Agilo CLI now supports both:

- instance setup/diagnostics (`onboard`, `doctor`, `configure`, `env`, `allowed-hostname`)
- control-plane client operations (issues, approvals, agents, activity, dashboard)

## Base Usage

Use repo script in development:

```sh
pnpm agilo --help
```

First-time local bootstrap + run:

```sh
pnpm agilo run
```

Choose local instance:

```sh
pnpm agilo run --instance dev
```

## Deployment Modes

Mode taxonomy and design intent are documented in `doc/DEPLOYMENT-MODES.md`.

Current CLI behavior:

- `agilo onboard` and `agilo configure --section server` set deployment mode in config
- runtime can override mode with `AGILO_DEPLOYMENT_MODE`
- `agilo run` and `agilo doctor` do not yet expose a direct `--mode` flag

Target behavior (planned) is documented in `doc/DEPLOYMENT-MODES.md` section 5.

Allow an authenticated/private hostname (for example custom Tailscale DNS):

```sh
pnpm agilo allowed-hostname dotta-macbook-pro
```

All client commands support:

- `--data-dir <path>`
- `--api-base <url>`
- `--api-key <token>`
- `--context <path>`
- `--profile <name>`
- `--json`

Company-scoped commands also support `--company-id <id>`.

Use `--data-dir` on any CLI command to isolate all default local state (config/context/db/logs/storage/secrets) away from `~/.agilo`:

```sh
pnpm agilo run --data-dir ./tmp/agilo-dev
pnpm agilo issue list --data-dir ./tmp/agilo-dev
```

## Context Profiles

Store local defaults in `~/.agilo/context.json`:

```sh
pnpm agilo context set --api-base http://localhost:3100 --company-id <company-id>
pnpm agilo context show
pnpm agilo context list
pnpm agilo context use default
```

To avoid storing secrets in context, set `apiKeyEnvVarName` and keep the key in env:

```sh
pnpm agilo context set --api-key-env-var-name AGILO_API_KEY
export AGILO_API_KEY=...
```

## Company Commands

```sh
pnpm agilo company list
pnpm agilo company get <company-id>
pnpm agilo company delete <company-id-or-prefix> --yes --confirm <same-id-or-prefix>
```

Examples:

```sh
pnpm agilo company delete AGILO --yes --confirm AGILO
pnpm agilo company delete 5cbe79ee-acb3-4597-896e-7662742593cd --yes --confirm 5cbe79ee-acb3-4597-896e-7662742593cd
```

Notes:

- Deletion is server-gated by `AGILO_ENABLE_COMPANY_DELETION`.
- With agent authentication, company deletion is company-scoped. Use the current company ID/prefix (for example via `--company-id` or `AGILO_COMPANY_ID`), not another company.

## Issue Commands

```sh
pnpm agilo issue list --company-id <company-id> [--status todo,in_progress] [--assignee-agent-id <agent-id>] [--match text]
pnpm agilo issue get <issue-id-or-identifier>
pnpm agilo issue create --company-id <company-id> --title "..." [--description "..."] [--status todo] [--priority high]
pnpm agilo issue update <issue-id> [--status in_progress] [--comment "..."]
pnpm agilo issue comment <issue-id> --body "..." [--reopen]
pnpm agilo issue checkout <issue-id> --agent-id <agent-id> [--expected-statuses todo,backlog,blocked]
pnpm agilo issue release <issue-id>
```

## Agent Commands

```sh
pnpm agilo agent list --company-id <company-id>
pnpm agilo agent get <agent-id>
pnpm agilo agent local-cli <agent-id-or-shortname> --company-id <company-id>
```

`agent local-cli` is the quickest way to run local Claude/Codex manually as a Agilo agent:

- creates a new long-lived agent API key
- installs missing Agilo skills into `~/.codex/skills` and `~/.claude/skills`
- prints `export ...` lines for `AGILO_API_URL`, `AGILO_COMPANY_ID`, `AGILO_AGENT_ID`, and `AGILO_API_KEY`

Example for shortname-based local setup:

```sh
pnpm agilo agent local-cli codexcoder --company-id <company-id>
pnpm agilo agent local-cli claudecoder --company-id <company-id>
```

## Approval Commands

```sh
pnpm agilo approval list --company-id <company-id> [--status pending]
pnpm agilo approval get <approval-id>
pnpm agilo approval create --company-id <company-id> --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]
pnpm agilo approval approve <approval-id> [--decision-note "..."]
pnpm agilo approval reject <approval-id> [--decision-note "..."]
pnpm agilo approval request-revision <approval-id> [--decision-note "..."]
pnpm agilo approval resubmit <approval-id> [--payload '{"...":"..."}']
pnpm agilo approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm agilo activity list --company-id <company-id> [--agent-id <agent-id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard Commands

```sh
pnpm agilo dashboard get --company-id <company-id>
```

## Heartbeat Command

`heartbeat run` now also supports context/api-key options and uses the shared client stack:

```sh
pnpm agilo heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100] [--api-key <token>]
```

## Local Storage Defaults

Default local instance root is `~/.agilo/instances/default`:

- config: `~/.agilo/instances/default/config.json`
- embedded db: `~/.agilo/instances/default/db`
- logs: `~/.agilo/instances/default/logs`
- storage: `~/.agilo/instances/default/data/storage`
- secrets key: `~/.agilo/instances/default/secrets/master.key`

Override base home or instance with env vars:

```sh
AGILO_HOME=/custom/home AGILO_INSTANCE_ID=dev pnpm agilo run
```

## Storage Configuration

Configure storage provider and settings:

```sh
pnpm agilo configure --section storage
```

Supported providers:

- `local_disk` (default; local single-user installs)
- `s3` (S3-compatible object storage)
