---
title: CLI Overview
summary: CLI installation and setup
---

The Agilo CLI handles instance setup, diagnostics, and control-plane operations.

## Usage

```sh
pnpm agilo --help
```

## Global Options

All commands support:

| Flag | Description |
|------|-------------|
| `--data-dir <path>` | Local Agilo data root (isolates from `~/.agilo`) |
| `--api-base <url>` | API base URL |
| `--api-key <token>` | API authentication token |
| `--context <path>` | Context file path |
| `--profile <name>` | Context profile name |
| `--json` | Output as JSON |

Company-scoped commands also accept `--company-id <id>`.

For clean local instances, pass `--data-dir` on the command you run:

```sh
pnpm agilo run --data-dir ./tmp/agilo-dev
```

## Context Profiles

Store defaults to avoid repeating flags:

```sh
# Set defaults
pnpm agilo context set --api-base http://localhost:3100 --company-id <id>

# View current context
pnpm agilo context show

# List profiles
pnpm agilo context list

# Switch profile
pnpm agilo context use default
```

To avoid storing secrets in context, use an env var:

```sh
pnpm agilo context set --api-key-env-var-name AGILO_API_KEY
export AGILO_API_KEY=...
```

Context is stored at `~/.agilo/context.json`.

## Command Categories

The CLI has two categories:

1. **[Setup commands](/cli/setup-commands)** — instance bootstrap, diagnostics, configuration
2. **[Control-plane commands](/cli/control-plane-commands)** — issues, agents, approvals, activity
