.PHONY: dev build test db-generate db-migrate db-seed db-truncate

# Start the development server
dev:
	pnpm dev

# Build all packages
build:
	pnpm build

# Run tests
test:
	pnpm test

# Database commands
db-generate:
	pnpm --filter @agilo/db generate

db-migrate:
	pnpm --filter @agilo/db migrate

db-seed:
	pnpm --filter @agilo/db seed

db-truncate:
	pnpm --filter @agilo/db truncate

# Clean the local embedded database
db-clean-local:
	rm -rf ~/.agilo/instances/default/db
