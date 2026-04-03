---
title: Setup Commands
summary: Onboard, run, doctor, and configure
---

Instance setup and diagnostics commands.

## `agilo run`

One-command bootstrap and start:

```sh
pnpm agilo run
```

Does:

1. Auto-onboards if config is missing
2. Runs `agilo doctor` with repair enabled
3. Starts the server when checks pass

Choose a specific instance:

```sh
pnpm agilo run --instance dev
```

## `agilo onboard`

Interactive first-time setup:

```sh
pnpm agilo onboard
```

If Agilo is already configured, rerunning `onboard` keeps the existing config in place. Use `agilo configure` to change settings on an existing install.

First prompt:

1. `Quickstart` (recommended): local defaults (embedded database, no LLM provider, local disk storage, default secrets)
2. `Advanced setup`: full interactive configuration

Start immediately after onboarding:

```sh
pnpm agilo onboard --run
```

Non-interactive defaults + immediate start (opens browser on server listen):

```sh
pnpm agilo onboard --yes
```

On an existing install, `--yes` now preserves the current config and just starts Agilo with that setup.

## `agilo doctor`

Health checks with optional auto-repair:

```sh
pnpm agilo doctor
pnpm agilo doctor --repair
```

Validates:

- Server configuration
- Database connectivity
- Secrets adapter configuration
- Storage configuration
- Missing key files

## `agilo configure`

Update configuration sections:

```sh
pnpm agilo configure --section server
pnpm agilo configure --section secrets
pnpm agilo configure --section storage
```

## `agilo env`

Show resolved environment configuration:

```sh
pnpm agilo env
```

## `agilo allowed-hostname`

Allow a private hostname for authenticated/private mode:

```sh
pnpm agilo allowed-hostname my-tailscale-host
```

## Local Storage Paths

| Data | Default Path |
|------|-------------|
| Config | `~/.agilo/instances/default/config.json` |
| Database | `~/.agilo/instances/default/db` |
| Logs | `~/.agilo/instances/default/logs` |
| Storage | `~/.agilo/instances/default/data/storage` |
| Secrets key | `~/.agilo/instances/default/secrets/master.key` |

Override with:

```sh
AGILO_HOME=/custom/home AGILO_INSTANCE_ID=dev pnpm agilo run
```

Or pass `--data-dir` directly on any command:

```sh
pnpm agilo run --data-dir ./tmp/agilo-dev
pnpm agilo doctor --data-dir ./tmp/agilo-dev
```
