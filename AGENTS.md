# AGENTS.md

Guidance for AI coding agents working in the **AWS Amplify JS** monorepo. Read this before making changes.

## Repository Overview

Amplify JS is a **Yarn + Turborepo** monorepo. Every package lives under `packages/<name>/`, each with its own `src/` and `package.json`. Packages are published under the `@aws-amplify/*` scope (plus the umbrella `aws-amplify` package).

Key packages:

| Package | Purpose |
|---|---|
| `@aws-amplify/core` | Shared runtime: config singleton, Hub, utils |
| `@aws-amplify/auth` | Cognito authentication |
| `@aws-amplify/storage` | S3 storage (client/utils + server/utils split) |
| `@aws-amplify/api`, `api-graphql`, `api-rest` | API categories |
| `@aws-amplify/analytics`, `geo`, `interactions`, `notifications`, `predictions`, `pubsub` | Feature categories |
| `aws-amplify` | Umbrella package re-exporting category APIs |
| `@aws-amplify/adapter-nextjs` | Next.js server adapter |

## Environment

| Requirement | Version |
|---|---|
| Node.js | 24 (pinned in CI; repo has no local `engines`/`.nvmrc`) |
| Yarn | 1.22.x |

## Build & Test Commands (MANDATORY: use `yarn`)

**Always drive builds/tests/lint through `yarn`. NEVER invoke `tsc`, `eslint`, `jest`, `npx`, or `tsx` directly** — the workspace scripts wire up the correct config and dependency graph. Single-package targeting goes through Turbo's `--filter` (see below).

```bash
# Install
yarn

# Build
yarn build                              # all packages
yarn turbo run build --filter=@aws-amplify/auth   # single package (+ its deps)

# Test
yarn test                               # full suite (use before final confirmation)
yarn turbo run test --filter=@aws-amplify/auth    # single package

# Lint
yarn lint                               # lint all packages
yarn turbo run lint --filter=@aws-amplify/auth    # single package

# Bundle size
yarn test:size                          # size-limit check (only runs for packages that define it)
yarn test:size --why                    # debug regression (Statoscope)

# Watch mode for local dev
yarn build:watch
yarn link-all                           # make all packages linkable

# Nuclear clean
git clean -xdf
```

Run `yarn` from the **monorepo root or a package root**. During implementation you may narrow with file/suite/test filters, but always run the full `test` / `lint` / `build` for final confirmation.

> **Single-package targeting must go through Turbo directly** — `yarn turbo run <task> --filter=@aws-amplify/<pkg>`. Do **not** pass `--filter` to the top-level `yarn build` / `yarn test` scripts: they are compound (`&&`) scripts, so the flag is misrouted to the trailing command and Turbo still runs unfiltered. (`--scope` is a Lerna flag — not valid for Turbo 2.x at all.)

## Testing Conventions

- **Do NOT mock `getConfig` on the Amplify singleton.** Mock the actual underlying modules/functions instead (real Amplify config approach).
- Write or update unit tests for any added/modified code. Be especially vigilant with shared code (race conditions).
- Passing unit tests are required for any PR that changes functionality.
- **Bundle-size (`size-limit`) checks only apply to packages that configure them.** Eight packages declare a `size-limit` key (`aws-amplify`, `core`, `datastore`, `geo`, `interactions`, `predictions`, `pubsub`, `api-graphql`), but `yarn test:size` only exercises the seven that also define a `test:size` script (all of the above except `api-graphql`). Filtering it to a package without size-limit configured (e.g. `auth`, `storage`) is a no-op.

## Code Conventions

- **License headers are required** on source files (enforced by the `license-test` CI check).
- **Never commit `tsconfig.tsbuildinfo` files.** A stray `packages/*/tsconfig.tsbuildinfo` causes `license-test` failures (`License not found in ...`). Remove it if generated.
- Preserve existing comments, JSDoc, and logging statements.
- Follow existing formatting (Prettier + ESLint config are applied via `yarn` scripts).

## Git Hooks (Husky)

The repo installs Husky hooks that run automatically — an agent committing or pushing will trigger them:

- **`pre-commit`** — runs `lint-staged` (`eslint --fix` on staged `*.ts`/`*.tsx`). Do not bypass with `--no-verify`.
- **`pre-push`** — runs a **git-secrets** scan and **blocks the push if git-secrets is not installed**. Install and register it before pushing:

```bash
brew install git-secrets   # or: apt-get install git-secrets
git secrets --register-aws
```

## Changesets (required for functional changes)

```bash
yarn changeset
```

Creates a file in `.changeset/`:

```markdown
---
'@aws-amplify/<package>': patch|minor|major
---

<type>(<scope>): description of the change.
```

**Skip a changeset** only for docs-only, formatting, or CI-only changes.

## Branch Naming

```
<scope>/<type>/<description>
```

- **scope**: category or alias (e.g. `auth`, `storage`, `core`)
- **type**: `feat` | `fix` | `docs` | `refactor` | `perf` | `test` | `build` | `ci` | `chore` | `revert`

Examples: `auth/fix/refresh-token-race-condition`, `storage/feat/presigned-urls`

## Commit / PR Flow

1. Make changes in `packages/<category>/`.
2. Add/update unit tests.
3. Add a changeset (if functional).
4. Validate: `yarn build` + `yarn test` (+ `yarn test:size` if bundle-sensitive).
5. Commit with a conventional message: `<type>(<scope>): summary`.
6. Push and open a PR filling out the template (description, linked issue, validation steps, checklist).

## CI Checks (must pass before merge)

| Check | Validates |
|---|---|
| `unit-tests` | Jest suites across packages |
| `native-unit-tests` | React Native tests |
| `bundle-size-tests` | Tree-shaken footprint (size-limit) |
| `license-test` | License headers present |
| `tsc-compliance-test` | TypeScript compilation |
| `dependency-review` | No problematic dependencies |
| `git-secrets-check` | No leaked AWS credentials |
| `github-actions-test` | CI config validity |

The `ci - Unit and Bundle tests have passed` gate turns green only when all above pass.

## Maintenance Branch: `v5-stable`

The `v5-stable` branch hosts Amplify JS v5 maintenance releases (security patches, critical fixes). **Do not apply this document's conventions there** — it uses different tooling (Lerna instead of Turborepo, no changesets, different setup and CI checks).

When backporting a fix to v5: branch off `v5-stable`, target the PR at `v5-stable`, and follow the `AGENTS.md` **on that branch** for its specific conventions.

## Do / Don't Summary

**Do**
- Use `yarn` for everything
- Add tests + changesets
- Keep license headers
- Mock underlying modules, not `Amplify.getConfig`

**Don't**
- Run `tsc`/`jest`/`eslint`/`npx` directly
- Commit `tsconfig.tsbuildinfo`
- Strip existing comments or logging
