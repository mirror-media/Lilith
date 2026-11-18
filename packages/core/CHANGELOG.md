# @mirrormedia/lilith-core Changelog

## 2026-11-12, Version 3.0.11-beta.14

### Notable Changes
- add `createLoginLockout` to lock repeated failed password logins per account and client IP; wraps the `authenticateUserWithPassword` mutation resolver in `extendGraphqlSchema`, so aliases, fragments and variable defaults are all counted
- `LOGIN_LOCKOUT_MODE` (`off` / `log` / `enforce`, default `log`); `LOGIN_LOCKOUT_MAX_FAILURES` (5), `LOGIN_LOCKOUT_WINDOW_SECONDS` (900), `LOGIN_LOCKOUT_DURATION_SECONDS` (900), `LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS` (no default; required for `enforce`), `LOGIN_LOCKOUT_LOCKED_DELAY_MS` (100), `LOGIN_LOCKOUT_STORE_TIMEOUT_MS` (500)
- a locked account gets exactly the same `Authentication failed.` result as a wrong password or an unknown account
- add `createMemoryLockoutStore` (per instance) and `createRedisLockoutStore` (pass an ioredis-compatible client; shared across instances)
- these use Node-only modules, so they are NOT exported from the package entry (the Admin UI bundles the entry and would fail with `Can't resolve 'net'`); load them on the server side with `require('@mirrormedia/lilith-core/lib/utils/login-lockout')` (the subpath has no type declarations for TypeScript consumers, so use `require`, as `login-logging` does)
- `createRedisLockoutStore` needs Redis 5.0 or later; create the ioredis client with `enableOfflineQueue: false` and a small `maxRetriesPerRequest`
- `enforce` requires an explicit `LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS` (an integer from 1 to 10, counted from the right of `x-forwarded-for`) and an explicit `store` option; without either the mode falls back to `log` with a one-time warning (pass `createMemoryLockoutStore()` to accept the per-instance memory store knowingly)
- when no `store` is passed, the default in-memory store is used (per instance, reset on restart) and a one-time warning is logged, unless the mode is `off`
- numeric settings must be plain whole numbers (`0x5`, `5e0`, `+5`, `1.5` are rejected) within a range: `LOGIN_LOCKOUT_MAX_FAILURES` 1 to 1000, `_WINDOW_SECONDS` and `_DURATION_SECONDS` 1 to 86400, `_STORE_TIMEOUT_MS` 1 to 60000, `_LOCKED_DELAY_MS` 0 to 10000, `_TRUSTED_PROXY_HOPS` 1 to 10; the same applies to the matching options; an invalid value falls back to the default and logs a warning once per distinct value (a 0 or a huge value would silently disable the lockout); mode `off` never warns
- in `log` mode every attempt writes an `attempt` line with `ip` and `forwardedCount` (how many `x-forwarded-for` entries), so `LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS` can be checked against real traffic before using `enforce`
- nothing is wired into any app yet

## 2026-11-06, Version 3.0.11-beta.13

### Notable Changes
- add `ANONYMOUS_WRITE_MODE` (`off` / `log` / `enforce`, default `log`) to `allowRoles` in `gql` and `preview` access control strategies
- `log` keeps behaviour and writes one `[anonymous-write]` line per anonymous create/update/delete; `enforce` rejects them; queries, `cms` and `restricted` are unchanged
- unrecognised `ANONYMOUS_WRITE_MODE` values fall back to `log` with a one-time warning
- add a minimal `tsx --test` setup to core; test files are not published

## 2025-12-02, Version 3.0.11-beta.2

### Notable Changes
- refactor: simplify role configuration and add `allowAllRoles` function
- add centralized ROLES array configuration for role management
- auto-generate role checker functions from ROLES array
- export `roleCheckers` object for programmatic access

### Commits
* \[[`21a345e59f30d4107d3ca35ef8fe6f2e019ac637`](https://github.com/mirror-media/Lilith/commit/21a345e59f30d4107d3ca35ef8fe6f2e019ac637)] - **refactor(lilith-core)**: simplify role configuration and add allowAllRoles function

## 2025-11-14, Version 3.0.11-beta.1

### Notable Changes
- add `createLoginLoggingPlugin` utility for logging user login events

### Commits
* Add login logging plugin utility

## 2025-04-02, Version 3.0.1

### Notable Changes
- fix: add missing dependency

### Commits
* \[[`1166c2db1e`](https://github.com/mirror-media/lilith-core/commit/1166c2db1e)] - **fix(core)**: add missing dependency (Tsuki Akiba)

## 2025-04-02, Version 3.0.0

### Notable Changes
- add `invalidateCacheAfterOperation` util

### Commits
* \[[`cabec32500`](https://github.com/mirror-media/lilith-core/commit/cabec32500)] - **feat(core)**: add invalidateCacheAfterOperation util (Tsuki Akiba)

## 2025-03-07, Version 2.6.0

### Notable Changes
- add utilities to create RichTextEditor views
- add mirrordaily view to RichTextEditor

### Commits
* \[[`515273a515`](https://github.com/mirror-media/lilith/commit/515273a515)] - **feat(core)**: add mirrordaily view to RichTextEditor (Tsuki Akiba)
* \[[`21b28aabbb`](https://github.com/mirror-media/lilith/commit/21b28aabbb)] - **refactor(core)**: add utilities to create RichTextEditor views (Tsuki Akiba)



## 2025-03-05, Version 2.5.1

### Notable Changes
- fix error in SelectWithColor component
- upgrade `@mirrormedia/lilith-draft-editor` to 2.2.1

### Commits
* \[[`d546e1f8fb`](https://github.com/mirror-media/lilith/commit/d546e1f8fb)] - **chore(core)**: upgrade `@mirrormedia/lilith-draft-editor` to 2.2.1 (Tsuki Akiba)
* \[[`90c4ebcc0e`](https://github.com/mirror-media/lilith/commit/90c4ebcc0e)] - **fix(core)**: error in SelectWithColor component (Tsuki Akiba)
* \[[`a50d26e8b8`](https://github.com/mirror-media/lilith/commit/a50d26e8b8)] - **chore(core)**: update Makefile (Tsuki Akiba)



## 2024-06-06, Version 2.4.0

### Notable Changes
- add filters
- add selectWithColor to custom field

### Commits
* \[[`289a418c1e`](https://github.com/mirror-media/lilith/commit/289a418c1e)] - feat(lilith-core): add selectWithColor to custom field (Tsuki Akiba)
* \[[`ec881bb919`](https://github.com/mirror-media/lilith/commit/ec881bb919)] - feat(lilith-core): add filters (Tsuki Akiba)



## 2023-12-14, Version 2.2.0

### Notable Changes
- upgrade lilith-draft-editor to 1.2.0

### Commits
* \[[`02a0101b74`](https://github.com/mirror-media/lilith/commit/02a0101b74)] - chore(lilith-core): upgrade lilith-draft-editor to 1.2.0 (Tsuki Akiba)

## 2023-12-13, Version 2.1.1

### Notable Changes
- fix errors in combineResolveInputHooks

### Commits
* \[[`97d846c67f`](https://github.com/mirror-media/lilith/commit/97d846c67f)] - fix(lilith-core): errors in combineResolveInputHooks (Tsuki Akiba)
* \[[`5200d0b2f4`](https://github.com/mirror-media/lilith/commit/5200d0b2f4)] - chore(lilith-core): bump version to 2.1.0 (Tsuki Akiba)

## 2023-12-13, Version 2.1.0

### Notable Changes
- fix type issues in richTextEditor
- fix type issues in trackingHandler util
- fix type issues in manual-order-relation-ship util
- fix type issues in accessControl util
- add type files to build process

### Commits
* \[[`20c3c2ddbc`](https://github.com/mirror-media/lilith/commit/20c3c2ddbc)] - chore(lilith-core): add type files to build process (Tsuki Akiba)
* \[[`f934203f71`](https://github.com/mirror-media/lilith/commit/f934203f71)] - fix(lilith-core): type issues in accessControl util (Tsuki Akiba)
* \[[`f33cbaf51f`](https://github.com/mirror-media/lilith/commit/f33cbaf51f)] - fix(lilith-core): type issues in manual-order-relationship util (Tsuki Akiba)
* \[[`269662a0b7`](https://github.com/mirror-media/lilith/commit/269662a0b7)] - fix(lilith-core): type issues in trackingHandler util (Tsuki Akiba)
* \[[`e7f6d49d50`](https://github.com/mirror-media/lilith/commit/e7f6d49d50)] - fix(lilith-core): issues in richTextEditor (Tsuki Akiba)
* \[[`8faab9bb14`](https://github.com/mirror-media/lilith/commit/8faab9bb14)] - chore(core): update dependency and bump version (caesar)

## 2023-03-06, Version 1.2.7

### Notable Changes

### Commits

* \[[`e56f10ca95`](https://github.com/mirror-media/lilith/commit/e56f10ca95)] - chore(core): upgrade Dep version `lilith-draft-editor`, bump version of `lilith-core` (DianYangFu)
* \[[`997e6f4c7b`](https://github.com/mirror-media/lilith/commit/997e6f4c7b)] - fix(draft-editor): solve error by adding `themeProvider` of `styled-component` (DianYangFu)

## 2023-02-22, Version 1.2.6

### Notable Changes

### Commits

- \[[`72ee64b41f`](https://github.com/mirror-media/lilith/commit/72ee64b41f)] - chore(lilith-core): bump version to 1.2.6 (caesar)
- \[[`21697e0342`](https://github.com/mirror-media/lilith/commit/21697e0342)] - refactor(lilith-core): add error log when website is absent (caesar)

## 2023-02-21, Version 1.2.5

### Notable Changes

- update import version of @mirrormedia/lilith-draft-editor

### Commits

- \[[`9930891760`](https://github.com/mirror-media/lilith/commit/9930891760)] - chore: bump versions (caesar)
- \[[`43e7c825bf`](https://github.com/mirror-media/lilith/commit/43e7c825bf)] - refactor(draft-editor): refine code to minimize bundle size and import specific bundle (caesar)

## 2023-02-16, Version 1.2.3

### Notable Changes

- update import version of @mirrormedia/lilith-draft-editor

### Commits

- \[[`0f09040349`](https://github.com/mirror-media/lilith/commit/0f09040349)] - chore: bump versions (caesar)
- \[[`5585f5da5b`](https://github.com/mirror-media/lilith/commit/5585f5da5b)] - refactor(draft-editor): remove and import renderer block from draft-editor and refine code (caesar)

## 2023-02-13, Version 1.2.2

### Notable Changes

- split drft-js logic into @mirrormedia/lilith-draft-editor

### Commits

- \[[`cee4b4a327`](https://github.com/mirror-media/lilith/commit/cee4b4a327)] - refactor(lilith-core): bump version to 1.2.2 (caesar)
- \[[`04545b4318`](https://github.com/mirror-media/lilith/commit/04545b4318)] - refactor(lilith-core): remove draft-js files (caesar)

## 2023-02-06, Version 1.2.1

### Notable Changes

- modify draft-js for Seinsights

### Commits

- \[[`52febde83f`](https://github.com/mirror-media/lilith/commit/52febde83f)] - chore(core): bump version to 1.2.1 (caesar)
- \[[`6658fc5e86`](https://github.com/mirror-media/lilith/commit/6658fc5e86)] - refactor(core): update image and slideshow button for Seinsights (caesar)

## 2022-12-23, Version 1.2.0

### Notable Changes

- export `utils.addManualOrderRelationshipFields`

### Commits

- \[[`93e5646796`](https://github.com/mirror-media/lilith/commit/93e5646796)] - chore(core): update pkg version to 1.2.0 (nickhsine)
- \[[`f819d3f50b`](https://github.com/mirror-media/lilith/commit/f819d3f50b)] - feat(core): export `utils.addManualOrderRelationshipFields` (nickhsine)

## 2022-12-12, Version 1.1.1

### Commits

- \[[`0464b22d5d`](https://github.com/mirror-media/lilith/commit/0464b22d5d)] - chore(core): update version to 1.1.1 (nickhsine)
- \[[`70ea495c60`](https://github.com/mirror-media/lilith/commit/70ea495c60)] - fix(core): (rich-text-editor) info-box unexpected error (nickhsine)

## 2022-09-20, Version 1.1.0

### Notable Changes

#### rich-text-editor

- disable buttons via config

#### Commits

- \[[`1d4330d7b4`](https://github.com/mirror-media/lilith/commit/1d4330d7b4)] - refactor(core): resolve circular dependency (nickhsine)
- \[[`40f09b347e`](https://github.com/mirror-media/lilith/commit/40f09b347e)] - refactor(core): update basic-editor.tsx. Use RichTextEditor with disabledButtons (nickhsine)
- \[[`a9ae1be0a1`](https://github.com/mirror-media/lilith/commit/a9ae1be0a1)] - feat(core): (rich-text-editor) disable buttons by field config (nickhsine)
- \[[`f8925d7ace`](https://github.com/mirror-media/lilith/commit/f8925d7ace)] - refactor(core): fix rich-text-editor typescript errors (nickhsine)
- \[[`c446dd13bd`](https://github.com/mirror-media/lilith/commit/c446dd13bd)] - refactor(core): pass lint (nickhsine)
