# ROCK-BUTTOM

> A unified **Stellar / Soroban** platform that merges blockchain education
> (verifiable on-chain credentials & learn-to-earn) with decentralized
> crowdfunding — so that **campaigns can fund scholarships, grants, and
> education causes** end to end.

This monorepo is the consolidation of two previously separate projects:

| Source project | Domain | Folded into |
|---|---|---|
| **Brain-Storm** | Blockchain education (credentials, learn-to-earn, governance) | `contracts/*`, `apps/backend`, `apps/web` |
| **Fund-My-Cause** | Decentralized crowdfunding (goal-based campaigns, refunds) | `contracts/crowdfund`, `contracts/registry`, `apps/web` |

The thematic bridge is concrete: Brain-Storm already ships `scholarship_fund`
and `grants` contracts, and Fund-My-Cause provides the missing crowdfunding
primitive that powers them.

---

## Monorepo layout

```
ROCK-BUTTOM/
├── apps/
│   ├── web/            # Unified frontend — Next.js 16 / React 19 / Tailwind 4
│   └── backend/        # NestJS REST API (Postgres + Redis) — shared API layer
├── contracts/          # Soroban smart contracts (Rust), one Cargo workspace
│   ├── shared/         # RBAC & shared utilities
│   ├── token/ certificate/ governance/ reputation/ ...   (education suite)
│   ├── scholarship_fund/ grants/                          (funding-for-education)
│   ├── crowdfund/      # goal-based campaign engine
│   └── registry/       # campaign discovery
├── packages/
│   └── types/          # Shared TypeScript types
├── Cargo.toml          # Rust workspace
├── package.json        # npm workspaces root
└── docs/
```

## Tech stack

- **Smart contracts:** Rust + Soroban SDK (standardized on the 25.x line)
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, TanStack Query, Freighter / WalletConnect
- **Backend:** NestJS, PostgreSQL + TypeORM, Redis, JWT
- **Tooling:** npm workspaces, Cargo workspace, Vitest, Playwright, Docker

## Status

Merge complete for the core platform:

- ✅ **Contracts:** 16 Soroban contracts in one Cargo workspace, standardized on
  `soroban-sdk` 25.x. `cargo build --workspace` is green.
- ✅ **Frontend:** `apps/web` on Next 16 / React 19 / Tailwind 4, with a
  `/scholarships` route bridging crowdfunding to on-chain scholarships.
- ✅ **Backend:** `apps/backend` (NestJS) wired as the shared API.
- ✅ **Workspaces:** `npm install` resolves across all packages (1941 deps).
- 🚧 **Tracked follow-ups:** `contracts/crowdfund` remediation
  ([docs/CROWDFUND_REMEDIATION.md](docs/CROWDFUND_REMEDIATION.md)) and the
  SDK 21→25 test-harness long-tail
  ([docs/TEST_MIGRATION_NOTES.md](docs/TEST_MIGRATION_NOTES.md)).

See [`docs/MERGE_PLAN.md`](docs/MERGE_PLAN.md) for the full phased plan and state.

## License

[MIT](./LICENSE)
