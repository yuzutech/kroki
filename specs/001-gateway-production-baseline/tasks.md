# Tasks: Gateway Production Baseline

**Input**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/README.md`

## Phase 1: Identity and Cache Foundation

- [x] T001 [US1] Add failing principal/key lifecycle tests in `product/gateway/test/auth.test.ts`.
- [x] T002 [US1] Implement principal and verifier records in `product/gateway/src/auth.ts`.
- [x] T003 [US1] Extend runtime key configuration and safety guards in `product/gateway/src/config.ts`.
- [x] T004 [US1] Add partition/sanitizer cache-key tests in `product/gateway/test/render-service.test.ts`.
- [x] T005 [US1] Implement partitioned cache/single-flight semantics in `product/gateway/src/render-service.ts`.
- [x] T006 [US1] Integrate principal authentication, scope authorization and principal rate limiting in `product/gateway/src/app.ts`.

## Phase 2: Admission and Output Trust Boundary

- [x] T007 [US2] Add failing bulkhead concurrency/queue/cleanup tests in `product/gateway/test/bulkhead.test.ts`.
- [x] T008 [US2] Implement bounded FIFO render bulkhead in `product/gateway/src/bulkhead.ts`.
- [x] T009 [US2] Add unsafe SVG, invalid PNG and size-limit tests in `product/gateway/test/output-validator.test.ts`.
- [x] T010 [US2] Implement output validation/sanitization in `product/gateway/src/output-validator.ts`.
- [x] T011 [US2] Apply bulkhead and output validation before cache writes in `product/gateway/src/render-service.ts`.
- [x] T012 [US2] Normalize capacity/output errors in `product/gateway/src/app.ts` and OpenAPI.

## Phase 3: Operations and Safe Configuration

- [x] T013 [US3] Add failing event redaction and metrics tests in `product/gateway/test/app.test.ts`.
- [x] T014 [US3] Implement aggregate metrics in `product/gateway/src/metrics.ts`.
- [x] T015 [US3] Implement allowlisted completion events and metrics endpoint in `product/gateway/src/app.ts`.
- [x] T016 [US3] Add bounded runtime configuration, production no-auth guard and tests in `product/gateway/src/config.ts` and `product/gateway/test/config.test.ts`.
- [x] T017 [US3] Update Compose environment and health/metrics configuration in `product/deploy/`.

## Phase 4: Contract, Documentation and Verification

- [x] T018 Update `docs/SDD.md`, `docs/openapi.yaml`, `docs/TestPlan.md`, operations docs and changelog.
- [x] T019 Update dependencies/lockfile and run Gateway-focused tests/typecheck.
- [x] T020 Run full clean product audit/typecheck/test/build and OpenAPI contract check.
- [x] T021 Run Compose SVG smoke and verify metrics/log redaction behavior.
- [x] T022 Run convergence audit against `spec.md`, `plan.md` and this task list.

## Dependencies

- T001-T006 establish principal context required by all later work.
- T007-T012 protect actual backend calls and output.
- T013-T017 consume principal/render state from prior phases.
- T018-T022 run after behavior is stable.
