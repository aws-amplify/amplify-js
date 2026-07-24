# AGENTS.md

Guidance for AI coding agents working on the **`v5-stable` maintenance branch** of AWS Amplify JS. Read this before making changes.

> **This branch is NOT `main`.** It hosts Amplify JS **v5** maintenance releases (security patches, critical fixes) and uses **Lerna**, not Turborepo. Conventions from `main`'s AGENTS.md (changesets, Turbo commands) do **not** apply here.

## Repository Overview

Amplify JS v5 is a **Yarn workspaces + Lerna** monorepo. Every category lives under `packages/<category>/`, each with its own `src/` and `package.json`. Packages are published under the `@aws-amplify/*` scope (plus the umbrella `aws-amplify` package, v5.x line).

## Scope of Changes

This is a **maintenance branch**. Acceptable changes:

- Security patches (dependency bumps for CVEs)
- Critical bug fixes
- CI/build fixes keeping the branch releasable

Do **not** add new features here — feature work targets `main`.

## Environment

| Requirement | Version |
|---|---|
| Node.js | 24 (used by CI) |
| Yarn | 1.22.x |

## Setup & Build Commands (MANDATORY: use `yarn`)

**Always drive builds/tests/lint through `yarn`. NEVER invoke `tsc`, `eslint`, `jest`, `lerna`, `npx`, or `tsx` directly** — the workspace scripts wire up the correct config and topological order.

```bash
# One-time setup (bootstrap is REQUIRED on this branch)
yarn setup-dev            # yarn && yarn bootstrap && yarn link-all && yarn build

# Or step by step:
yarn                      # install
yarn bootstrap            # lerna bootstrap (links cross-package deps)
yarn build                # lerna run build + duplicate check

# Test
yarn test                 # lerna run test + license + github-actions checks
yarn test:size            # size-limit checks (per-package, --no-bail)

# Lint / format
yarn lint                 # lerna run lint
yarn format               # lerna run format

# Watch mode
yarn build:watch          # cjs + esm watch in parallel

# Clean
yarn clean
```

To scope a command to one package, use Lerna's `--scope` via the script, e.g.:

```bash
npx lerna run test --scope @aws-amplify/auth --stream   # via yarn script equivalents when available
```

Prefer running the full `yarn test` / `yarn build` for final confirmation.

## Versioning & Release (NO changesets)

**This branch does NOT use changesets** — there is no `.changeset/` directory. Versions are managed by **Lerna with conventional commits**:

- Version bumps are derived from commit messages (`fix:` → patch, `feat:` → minor).
- Releases are published with `publish:v5-stable` (dist-tag `stable-5`) by maintainers/CI.
- **Your commit message IS the changelog entry.** Use conventional commit format: `<type>(<scope>): summary`.

## Testing Conventions

- Write or update unit tests for any fixed code.
- Passing unit tests are required for any PR that changes functionality.
- Bundle-size checks (`yarn test:size`) run per-package where a `size-limit` config exists.

## Code Conventions

- **License headers are required** on source files (enforced by the `license-test` CI check via `license-check-and-add`).
- Preserve existing comments, JSDoc, and logging statements.
- Formatting: Prettier via `pretty-quick` (runs on staged files in the pre-commit hook).

## Git Hooks (husky v3)

- **`pre-commit`** — runs `pretty-quick --staged` (Prettier on staged files). Configured in `package.json` under the `husky.hooks` key (husky v3 style, no `.husky/` directory).
- There is no pre-push git-secrets hook on this branch, but **never commit credentials** — CI and org-level scanning still apply.

## Branch & PR Flow

1. Branch off `v5-stable`: `<scope>/<type>/<description>` (e.g. `core/fix/cve-2026-1234`).
2. Make changes in `packages/<category>/`, add/update tests.
3. Validate: `yarn bootstrap && yarn build && yarn test`.
4. Commit with a conventional message (drives Lerna versioning): `fix(<scope>): summary`.
5. Push and open a PR **targeting `v5-stable`** (NOT `main`).

## CI Checks (must pass before merge)

| Check | Validates |
|---|---|
| `unit-tests` | Jest suites across packages |
| `bundle-size-tests` | Tree-shaken footprint (size-limit) |
| `license-test` | License headers present |
| `github-actions-test` | CI config validity |

The `ci - Unit and Bundle tests have passed` gate turns green only when all above pass.

## Do / Don't Summary

**Do**
- Run `yarn bootstrap` after install (Lerna linking)
- Use conventional commit messages (they drive versioning)
- Target PRs at `v5-stable`
- Keep license headers

**Don't**
- Add changesets (this branch has none — versioning is Lerna/conventional-commits)
- Add new features (maintenance branch)
- Run `lerna`/`tsc`/`jest`/`eslint` directly — go through `yarn` scripts
- Target PRs at `main`
- Strip existing comments or logging
