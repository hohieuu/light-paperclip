# Plugin Authoring Smoke Example

A Agilo plugin

## Development

```bash
pnpm install
pnpm dev            # watch builds
pnpm dev:ui         # local dev server with hot-reload events
pnpm test
```

## Install Into Agilo

```bash
pnpm agilo plugin install ./
```

## Build Options

- `pnpm build` uses esbuild presets from `@agilo/plugin-sdk/bundlers`.
- `pnpm build:rollup` uses rollup presets from the same SDK.
