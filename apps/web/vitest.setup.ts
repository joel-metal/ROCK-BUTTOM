import "@testing-library/jest-dom/vitest";
import { expect, vi } from "vitest";
import { toHaveNoViolations } from "jest-axe";

// Accessibility matcher (jest-axe is runner-agnostic and works under Vitest).
expect.extend(toHaveNoViolations);

// ---------------------------------------------------------------------------
// Jest -> Vitest compatibility shim
// ---------------------------------------------------------------------------
// These tests were inherited from a Jest suite and call the `jest.*` API. Vitest's
// `vi` mirrors that API, so we alias it globally. This covers the runtime helpers:
//   jest.fn / spyOn / clearAllMocks / resetAllMocks / restoreAllMocks /
//   useFakeTimers / useRealTimers / advanceTimersByTime / runAllTimers / resetModules
//
// KNOWN FOLLOW-UP (docs/TEST_MIGRATION_NOTES.md): `jest.mock()` factory calls are NOT
// hoisted by Vitest's transform (only `vi.mock` is), and `jest.requireActual` /
// `jest.requireMock` have no direct `vi` equivalent. Files relying on module mocking
// still need a `jest.mock` -> `vi.mock` conversion to run fully green.
(globalThis as unknown as { jest: typeof vi }).jest = vi;
