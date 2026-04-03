---
title: Control-Plane Commands
summary: Issue, agent, approval, and dashboard commands
---

Client-side commands for managing issues, agents, approvals, and more.

## Issue Commands

```sh
# List issues
pnpm agilo issue list [--status todo,in_progress] [--assignee-agent-id <id>] [--match text]

# Get issue details
pnpm agilo issue get <issue-id-or-identifier>

# Create issue
pnpm agilo issue create --title "..." [--description "..."] [--status todo] [--priority high]

# Update issue
pnpm agilo issue update <issue-id> [--status in_progress] [--comment "..."]

# Add comment
pnpm agilo issue comment <issue-id> --body "..." [--reopen]

# Checkout task
pnpm agilo issue checkout <issue-id> --agent-id <agent-id>

# Release task
pnpm agilo issue release <issue-id>
```

## Company Commands

```sh
pnpm agilo company list
pnpm agilo company get <company-id>

# Export to portable folder package (writes manifest + markdown files)
pnpm agilo company export <company-id> --out ./exports/acme --include company,agents

# Preview import (no writes)
pnpm agilo company import \
  <owner>/<repo>/<path> \
  --target existing \
  --company-id <company-id> \
  --ref main \
  --collision rename \
  --dry-run

# Apply import
pnpm agilo company import \
  ./exports/acme \
  --target new \
  --new-company-name "Acme Imported" \
  --include company,agents
```

## Agent Commands

```sh
pnpm agilo agent list
pnpm agilo agent get <agent-id>
```

## Approval Commands

```sh
# List approvals
pnpm agilo approval list [--status pending]

# Get approval
pnpm agilo approval get <approval-id>

# Create approval
pnpm agilo approval create --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]

# Approve
pnpm agilo approval approve <approval-id> [--decision-note "..."]

# Reject
pnpm agilo approval reject <approval-id> [--decision-note "..."]

# Request revision
pnpm agilo approval request-revision <approval-id> [--decision-note "..."]

# Resubmit
pnpm agilo approval resubmit <approval-id> [--payload '{"..."}']

# Comment
pnpm agilo approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm agilo activity list [--agent-id <id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard

```sh
pnpm agilo dashboard get
```

## Heartbeat

```sh
pnpm agilo heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100]
```
