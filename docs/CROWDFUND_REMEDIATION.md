# Crowdfund contract — remediation required

The `contracts/crowdfund` contract (the centerpiece of the Rock-Buttom side)
**does not compile as inherited from the Rock-Buttom `main` branch.** It is
temporarily excluded from the Cargo workspace (`Cargo.toml` → `exclude`) so the
rest of the platform builds green.

It is deliberately **not** auto-fixed: this contract custodies user funds, and
several referenced types are simply undefined in the source, so any "fix" would
mean inventing financial semantics. That must be done deliberately, with tests.

## Why it fails

`cargo build -p crowdfund` surfaces these categories of error:

### 1. Pre-existing source corruption (fixed)
- `src/errors.rs` — the `ContractError` enum was closed early with a stray `}`,
  leaving variants 40–46 orphaned and a duplicate `NotCreator`. **Already fixed**
  in this repo.

### 2. Undefined types referenced in `src/lib.rs`
These are used but never declared anywhere in `src/types.rs` (or elsewhere):
- `RewardConfig`
- `SearchIndexEntry`
- `EventCampaignCloned`
- `EventCampaignIndexed`
- `EventRewardsConfigured`
- `EventRewardsDistributed`

Each must be defined as a `#[contracttype]` (or `#[contractevent]`) with fields
inferred from its construction sites in `lib.rs` (e.g. the `EventRewardsConfigured { .. }`
literal around line 3679, `EventCampaignIndexed { .. }` around line 3793).

### 3. Removed / changed Soroban SDK APIs (21.x → 25.x)
- `env.invoker()` — removed. Replace with the appropriate `require_auth` /
  `Address` argument pattern (2 call sites).
- `soroban_sdk::Vec::iter_mut()` — Soroban `Vec` has no `iter_mut`. Rebuild the
  vector immutably (map/collect) or index-and-`set` (2 call sites).
- A `#[contracterror]`/event publish path still uses the deprecated
  `env.events().publish(..)` instead of the `#[contractevent]` macro.

## Suggested approach

1. Define the six missing types from their usage sites; add unit tests for each.
2. Migrate the two `env.invoker()` sites and two `iter_mut()` sites.
3. Re-enable in `Cargo.toml` by removing `contracts/crowdfund` from `exclude`.
4. `cargo test -p crowdfund` must pass before this contract is considered merged.

Until then, campaign discovery via `contracts/registry` builds and is usable.
