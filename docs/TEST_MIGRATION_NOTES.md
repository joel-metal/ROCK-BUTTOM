# Test-harness migration notes (Soroban SDK 21 → 25)

All contract **libraries build green** on `soroban-sdk` 25.x (`cargo build --workspace`).
The remaining failures are confined to **test code** that uses `testutils` APIs and
semantics that changed between SDK 21 and 25. None of them indicate a bug in the
deployable contract logic.

## Status by category

| Category | Status | Notes |
|---|---|---|
| Library compilation | ✅ green | All workspace members build |
| Most unit tests | ✅ pass | e.g. token 43/63, analytics 38/41 |
| Event-assertion helpers | ⚠️ migrated where hit | `Events::all()` now returns `ContractEvents` (see analytics `has_event`) |
| Ledger-advancing tests | ❌ fail | `Ledger::set(LedgerInfo)` rejects the legacy `LedgerInfo` shape |
| `should_panic` auth tests | ❌ fail | SDK 25 default auth enforcement differs |

## Root causes & fixes

### 1. `Events::all()` return type changed
`env.events().all()` now returns `ContractEvents` (was `Vec<(Address, Vec<Val>, Val)>`).
- Use `.events()` to get `&[xdr::ContractEvent]` and match `ContractEventBody::V0`.
- Or compare directly: `ContractEvents` implements `PartialEq<Vec<(Address, Vec<Val>, Val)>>`.
- Migrated: `contracts/analytics/src/lib.rs::has_event`.

### 2. `LedgerInfo` construction (the big one — ~20 token tests)
Tests that call `env.ledger().set(LedgerInfo { .. })` to advance time panic with
`HostError: Error(Context, InternalError)` because SDK 25 validates additional
`LedgerInfo` fields. **Fix:** build ledger state with `env.ledger().with_mut(|li| { .. })`
or populate the new required fields, instead of constructing a full `LedgerInfo`
in the SDK-21 shape. This is a single shared test helper in `token`'s test module.

### 3. Private `Address::from_contract_id`
Now private. Use `Address::generate(&env)` (testutils) for arbitrary test addresses.
- Migrated: `contracts/token/src/fuzz_tests.rs`.

### 4. Default auth enforcement
`should_panic` tests that expect an unauthorized call to panic may need explicit
`env.set_auths(&[])` / not calling `env.mock_all_auths()` to reproduce the SDK-21
behavior under SDK 25.

## Recommended follow-up

Fix the shared `LedgerInfo` test helper first — it unblocks the largest cluster
(~20 token tests) in one change. Then revisit auth `should_panic` tests per contract.

---

# Frontend: Jest → Vitest standardization (`apps/web`)

The platform standardizes on **Vitest** as the single frontend test runner. The
inherited Rock-Buttom suite was written against Jest (the repo shipped both
configs). Done in this repo:

- `apps/web` scripts: `test` / `test:coverage` now run Vitest; Jest scripts removed.
- Removed `jest.config.ts`, `jest.setup.ts`, and the Jest runner devDeps
  (`jest`, `ts-jest`, `jest-environment-jsdom`, `@types/jest`).
- `vitest.setup.ts` adds a `jest → vi` global shim so the ~290 `jest.fn` /
  `jest.spyOn` / `jest.clearAllMocks` / fake-timer calls run unchanged.

### Remaining follow-up
- **`jest.mock()` hoisting (~70 calls):** Vitest hoists only `vi.mock`. Convert
  `jest.mock(` → `vi.mock(` in the affected test files so module mocks intercept
  imports correctly.
- **`jest.requireActual` (1) / `jest.requireMock` (8):** map to `vi.importActual` /
  `vi.importMock` (async) where used.
- **`jest.Mock` type (10):** replace with Vitest's `Mock` type. Type-only, so it
  does not break runtime, but `tsc` will flag it.

Run `npm run test --workspace=@rock-buttom/web` after these to confirm green.
