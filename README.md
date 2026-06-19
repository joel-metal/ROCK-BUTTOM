<div align="center">

# ROCK-BUTTOM

**A unified Stellar / Soroban platform where decentralized crowdfunding powers on-chain education.**

Verifiable credentials and learn-to-earn meet goal-based fundraising — so a single
campaign can fund scholarships, grants, and education causes from end to end.

[![CI](https://github.com/joel-metal/ROCK-BUTTOM/actions/workflows/ci.yml/badge.svg)](https://github.com/joel-metal/ROCK-BUTTOM/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar%20Soroban-7B00FF.svg)](https://soroban.stellar.org)
[![Rust](https://img.shields.io/badge/Rust-soroban--sdk%2025.x-CE412B.svg?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?logo=next.js)](https://nextjs.org)

</div>

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Testing](#testing)
- [Project status](#project-status)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

ROCK-BUTTOM unifies two capability areas — blockchain education and decentralized
crowdfunding — in one monorepo:

| Capability | Domain | Lives in |
| --- | --- | --- |
| **Education suite** | Credentials, learn-to-earn, governance | `contracts/*`, `apps/backend`, `apps/web` |
| **Crowdfunding engine** | Goal-based campaigns, pull-based refunds | `contracts/crowdfund`, `contracts/registry`, `apps/web` |

The integration is more than co-location. The education suite already ships
`scholarship_fund` and `grants` contracts; the crowdfunding engine supplies the
campaign mechanics those features always implied. Together they form a single flow:
**contribute to a campaign → funds are held and released on-chain → scholarships and
grants are disbursed with verifiable credentials.**

## Features

- 🎓 **Education suite** — token rewards, certificates, reputation, governance, NFTs, and badges as Soroban contracts.
- 💸 **Crowdfunding engine** — goal-based campaigns with pull-based refunds and a discovery registry.
- 🌉 **Scholarship bridge** — the `/scholarships` route routes campaign funding into the `scholarship_fund` and `grants` contracts.
- 🔐 **Wallet-native** — Freighter and WalletConnect integration via the Stellar SDK.
- 🧩 **Single workspace** — one Cargo workspace for contracts, one npm workspace for apps and packages.

## Architecture

ROCK-BUTTOM is a three-tier system: a Next.js frontend, a NestJS API, and a suite
of Soroban smart contracts on Stellar. The wallet signs transactions client-side;
the backend holds off-chain state (users, courses, progress) and mirrors on-chain
events; the contracts are the source of truth for funds and credentials.

### System overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│          CLIENT   ·   apps/web — Next.js 16 · React 19 · Tailwind 4         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Navbar          ProgressBar       PledgeModal       CountdownTimer          │
│ Freighter conn  campaign progress contribution flow  deadline               │
│                                                                             │
│ WalletContext — Freighter · WalletConnect · Lobstr                          │
│ address · connect() · disconnect() · signTx()                               │
└─────────────────────────────────────────────────────────────────────────────┘
                     │                                        │
                     │ off-chain data (REST)                  │ sign & submit XDR
                     ▼                                        ▼
┌──────────────────────────────────────────┐  ┌───────────────────────────────┐
│      apps/backend — NestJS REST API      │  │      Stellar Soroban RPC      │
├──────────────────────────────────────────┤  ├───────────────────────────────┤
│ TypeORM · JWT · chain indexer            │  │ simulate · submit · poll      │
│                                          │  │                               │
│ auth · courses · enrollments             │  │ + Horizon API                 │
│ progress · certificates · payouts        │  │ balances · transactions       │
│ notifications · search · analytics       │  │                               │
│                                          │  │                               │
│ PostgreSQL        Redis                  │  │                               │
│ users · courses   cache · sessions       │  │                               │
└──────────────────────────────────────────┘  └───────────────────────────────┘
                     │                                        │
                     │ via Stellar SDK                        │ invoke contracts
                     └─────────────────┬──────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             contracts/ — Soroban smart contracts (Rust · wasm32)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Crowdfunding  crowdfund · registry                                          │
│               initialize() contribute() withdraw() refund_single()          │
│                                                                             │
│ Education     token (SEP-41) · certificate · governance · reputation        │
│               mint_reward() issue_credential() propose() vote()             │
│                                                                             │
│ Funding       scholarship_fund · grants  (milestone disbursement)           │
│ Shared        RBAC · pausable · reentrancy guard · validation               │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │ store state
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                Stellar Ledger                               │
│        instance & persistent storage (TTL) · 5s finality · immutable        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key flow** — a contributor connects Freighter and pledges to a campaign
(`contribute()`); funds are escrowed on-chain. On success the owner calls
`withdraw()`, the `scholarship_fund` / `grants` contracts disburse to recipients,
and the `certificate` and `token` contracts mint verifiable credentials and reward
tokens. If a goal misses its deadline, contributors reclaim funds via pull-based
`refund_single()`. The backend indexes these on-chain events to serve off-chain
views — courses, progress, notifications — while the wallet signs every state change.

### Repository layout

```
ROCK-BUTTOM/
│
├── apps/
│   ├── web/                         # Frontend — Next.js 16 · React 19 · Tailwind 4
│   │   └── src/
│   │       ├── app/                 # App Router: [locale], campaigns, dashboard,
│   │       │                        #   create, compare, refund, embed, scholarships
│   │       ├── components/          # ui/ · layout/ · create/
│   │       ├── context/             # Wallet, Theme, Comparison, Bookmark, Modal…
│   │       ├── hooks/               # useCampaign, useSearchSuggestions, …
│   │       ├── lib/                 # soroban, contract client, price, validation…
│   │       ├── services/            # API + RPC clients
│   │       ├── i18n/                # next-intl routing & messages
│   │       └── types/               # campaign, soroban, milestone types
│   │
│   └── backend/                     # REST API — NestJS · PostgreSQL/TypeORM · Redis · JWT
│       └── src/
│           ├── auth/ access-control/ kyc/ secrets/        # identity & security
│           ├── courses/ enrollments/ quizzes/ progress/   # learning domain
│           │   certificates/ credentials/ leaderboard/
│           ├── payouts/ coupons/ stellar/                 # funding & chain bridge
│           ├── notifications/ email/ search/ analytics/   # platform services
│           │   metrics/ audit/ moderation/ forums/ …
│           └── common/ config/ migrations/                # cross-cutting
│
├── contracts/                       # Soroban smart contracts (Rust) — one Cargo workspace
│   ├── shared/                      # RBAC · pausable · reentrancy · validation
│   │
│   ├── ── Education & rewards ──
│   ├── token/                       # SEP-41 reward token (mint, vesting, airdrop)
│   ├── certificate/                 # verifiable course credentials
│   ├── reputation/  governance/     # on-chain reputation & voting
│   ├── nft/  badges/                # achievement NFTs & badges
│   ├── analytics/  credential_metadata/
│   ├── royalty_distribution/  token_restrictions/  liquidity_pool/  buyback/
│   │
│   ├── ── Funding for education ──
│   ├── scholarship_fund/            # holds & disburses scholarship funds
│   ├── grants/                      # milestone-based education grants
│   │
│   ├── ── Crowdfunding ──
│   ├── crowdfund/                   # goal-based campaign engine  (⚠ quarantined)
│   ├── registry/                    # campaign discovery
│   └── benchmarks/                  # bench harness (excluded from workspace)
│
├── packages/
│   └── types/                       # @rock-buttom/types — shared TS types (stellar,
│                                    #   course, progress, auth, quiz, enrollment…)
│
├── docs/                            # MERGE_PLAN · CROWDFUND_REMEDIATION · TEST_MIGRATION_NOTES
├── .github/workflows/ci.yml         # CI: contracts · web · backend
├── Cargo.toml                       # Rust workspace manifest
└── package.json                     # npm workspaces root
```

## Tech stack

| Layer | Technologies |
| --- | --- |
| Smart contracts | Rust, Soroban SDK 25.x |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TanStack Query, Freighter, WalletConnect |
| Backend | NestJS, PostgreSQL, TypeORM, Redis, JWT |
| Tooling | npm workspaces, Cargo workspace, Vitest, Playwright, Docker, commitlint, Husky |

## Getting started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (stable) with the `wasm32-unknown-unknown` target
- [Node.js](https://nodejs.org) 20 or newer, with npm 10+
- (Optional) [Stellar CLI](https://developers.stellar.org/docs/tools/cli) for deploying contracts

```bash
rustup target add wasm32-unknown-unknown
```

### Installation

```bash
git clone https://github.com/joel-metal/ROCK-BUTTOM.git
cd ROCK-BUTTOM
npm install
```

### Configuration

Copy the environment templates and fill in your values:

```bash
cp .env.example .env                    # shared Stellar/network overview
cp apps/web/.env.example apps/web/.env.local
cp apps/backend/.env.example apps/backend/.env
```

### Run

```bash
# Smart contracts
npm run contracts:build        # cargo build (release, wasm target)
npm run contracts:test         # cargo test --workspace

# Frontend (http://localhost:3000)
npm run dev:web

# Backend API
npm run dev:backend
```

## Available scripts

Run from the repository root:

| Script | Description |
| --- | --- |
| `npm run dev:web` | Start the Next.js frontend in development |
| `npm run dev:backend` | Start the NestJS API in watch mode |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run unit tests across workspaces |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run contracts:build` | Compile contracts to WASM (release) |
| `npm run contracts:test` | Run the Rust contract test suite |
| `npm run format` | Format the repo with Prettier |

## Testing

```bash
cargo test --workspace                          # Soroban contracts (Rust)
npm run test --workspace=@rock-buttom/web       # Frontend unit tests (Vitest)
npm run test --workspace=@rock-buttom/backend   # Backend tests (Jest)
```

The CI pipeline ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the
contract, web, and backend jobs on every push and pull request to `main`.

## Project status

The core platform merge is complete and verified:

- ✅ 16 Soroban contracts in one Cargo workspace, standardized on `soroban-sdk` 25.x — `cargo build --workspace` passes.
- ✅ `apps/web` on Next.js 16 / React 19 / Tailwind 4, including the `/scholarships` bridge route.
- ✅ `apps/backend` (NestJS) wired as the shared API, with `@rock-buttom/types` shared across apps.
- ✅ npm workspaces resolve and install cleanly across all packages.

**Known follow-ups** (tracked, not blocking the build):

- `contracts/crowdfund` is quarantined pending remediation — it ships incomplete in the upstream source. See [docs/CROWDFUND_REMEDIATION.md](docs/CROWDFUND_REMEDIATION.md).
- A Soroban SDK 21 → 25 test-harness migration long-tail remains. See [docs/TEST_MIGRATION_NOTES.md](docs/TEST_MIGRATION_NOTES.md).

## Documentation

| Document | Purpose |
| --- | --- |
| [docs/MERGE_PLAN.md](docs/MERGE_PLAN.md) | Phased integration plan and current state |
| [docs/CROWDFUND_REMEDIATION.md](docs/CROWDFUND_REMEDIATION.md) | What the crowdfund contract needs to rejoin the workspace |
| [docs/TEST_MIGRATION_NOTES.md](docs/TEST_MIGRATION_NOTES.md) | SDK 21 → 25 test migration notes |

## Contributing

Contributions are welcome. This repository uses
[Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint
and a Husky `commit-msg` hook):

```
feat(web): add campaign comparison view
fix(contracts): correct overflow check in scholarship_fund
```

Before opening a pull request, please make sure `cargo build --workspace` and the
relevant workspace tests pass.

## License

Released under the [MIT License](./LICENSE).
