# Merge Plan — Brain-Storm + Fund-My-Cause → ROCK-BUTTOM

This document tracks the phased consolidation of the two source projects into a
single Stellar/Soroban platform.

## Goal

One platform where crowdfunding powers scholarships/grants. The domains fit:
Brain-Storm already has `scholarship_fund` and `grants` contracts; Fund-My-Cause
supplies the crowdfunding engine those features imply.

## Phases

### Phase 1 — Cargo workspace (foundation)
- [x] Scaffold unified monorepo + tooling roots
- [ ] Copy all contracts into a single `contracts/` workspace (no name clashes)
- [ ] Standardize every contract on `soroban-sdk` 25.x (upgrade Brain-Storm's 21.x)
- [ ] Verify with `cargo build` + `cargo test`

### Phase 2 — Frontend
- [ ] Adopt Fund-My-Cause's `interface` (Next 16 / React 19 / Tailwind 4) as `apps/web`
- [ ] Port Brain-Storm's education UI onto the unified stack
- [ ] Standardize on a single test runner (Vitest)

### Phase 3 — Backend
- [ ] Bring in Brain-Storm's NestJS backend as the shared API layer
- [ ] Wire shared TypeScript types package

### Phase 4 — Tooling & ops
- [ ] Unify npm workspaces, CI, Docker, commit tooling
- [ ] Consolidate docs

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Soroban SDK version | 25.x | Forward path; 21.x predates current toolchains |
| Frontend base | Fund-My-Cause interface | Next 16 / React 19 / Tailwind 4 is the forward stack |
| Backend | Brain-Storm NestJS | Only backend that exists; serves both domains |
| Test runner | Vitest | Avoid maintaining Jest + Vitest in parallel |

## Contract inventory

**Education suite (from Brain-Storm):** shared, token, certificate, governance,
analytics, credential_metadata, reputation, buyback, scholarship_fund,
token_restrictions, liquidity_pool, grants, badges, nft, royalty_distribution

**Crowdfunding (from Fund-My-Cause):** crowdfund, registry

No directory-name collisions exist between the two sets.
