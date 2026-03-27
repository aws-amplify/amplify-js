# SOP: Remove Amplify Singleton — Refactor to Explicit Context Passing

## Objective

Remove the `AmplifyClass` singleton from `@aws-amplify/core` and replace it with a pure-function `configure()` that returns an explicit `AmplifyContext` object. All category APIs (storage, auth, analytics, etc.) will accept this context as their first argument, making inter-category dependencies explicit and preserving tree-shaking.

This is a breaking change.

---

## Current Architecture (Before)

```
Amplify.configure(outputs)          // mutates singleton
uploadData({ path, data })          // internally imports singleton, calls Amplify.Auth.fetchAuthSession()
```

- `AmplifyClass` singleton in `@aws-amplify/core` holds `resourcesConfig`, `libraryOptions`, and an `Auth` instance.
- `aws-amplify` wraps it via `DefaultAmplify` which wires up Cognito providers on `configure()`.
- Each category's public API imports the `Amplify` singleton and passes it to internal functions: e.g. `getPropertiesInternal(Amplify, input)`.
- Internal functions receive `AmplifyClassV6` and call `amplify.Auth.fetchAuthSession()`, `amplify.getConfig()`, `amplify.libraryOptions`.

## Target Architecture (After)

```
const ctx = configure(outputs)      // pure function, returns frozen context
uploadData(ctx, { path, data })     // explicit dependency
```

- `configure()` is a pure function returning a frozen `AmplifyContext` object.
- Categories receive `AmplifyContext` as first argument — no global state.
- `amplify_outputs.json` format is unchanged.
- Tree-shaking preserved — all exports remain pure functions.

---

## Phase 1: Define the New Contract

**Goal:** Introduce the `AmplifyContext` type and `configure()` function alongside the existing singleton, without breaking anything yet.

### Step 1.1 — Define `AmplifyContext` type

**Location:** `packages/core/src/singleton/AmplifyContext.ts`

Define a plain object type that replaces `AmplifyClass` as the contract categories depend on:

```ts
interface AmplifyContext {
  resourcesConfig: ResourcesConfig;
  libraryOptions: LibraryOptions;
  fetchAuthSession(options?: FetchAuthSessionOptions): Promise<AuthSession>;
  clearCredentials(): Promise<void>;
  getTokens(options: FetchAuthSessionOptions): Promise<AuthTokens | undefined>;
}
```

Export from `packages/core/src/index.ts`.

### Step 1.2 — Create `configure()` pure function

**Location:** `packages/aws-amplify/src/configure.ts`

Port the logic from `DefaultAmplify.configure()` (`packages/aws-amplify/src/initSingleton.ts`) into a pure function that:

1. Calls `parseAmplifyConfig(resourcesConfig)` to normalize the config.
2. Wires up Cognito token provider and credentials provider (same as current `DefaultAmplify`).
3. Instantiates `AuthClass`, calls `auth.configure(...)`.
4. Returns a frozen `AmplifyContext` object.

Does NOT mutate any global state.

Export from `packages/aws-amplify/src/index.ts` alongside the existing `Amplify` (for now).

### Step 1.3 — Export `AmplifyContext` from `aws-amplify`

Update `packages/aws-amplify/src/index.ts`:

```ts
export { configure } from './configure';
export type { AmplifyContext } from '@aws-amplify/core';
```

### Verification

- Existing code still works (singleton untouched).
- `configure(outputs)` returns a valid `AmplifyContext`.
- Unit test: `configure()` returns frozen object with correct config and working `auth.fetchAuthSession`.

---

## Phase 2: Configuration Builder

**Goal:** Provide a fluent language-API for constructing `amplify_outputs.json`-compatible config objects programmatically, enabling runtime reconfiguration (e.g. switching Cognito user pools via UI).

The builder output conforms to the [Amplify Outputs schema v1.4](https://raw.githubusercontent.com/aws-amplify/amplify-backend/refs/heads/main/packages/client-config/src/client-config-schema/schema_v1.4.json).

### Step 2.1 — Define builder types

**Location:** `packages/core/src/configurationBuilder/types.ts`

The builder produces an object matching `AmplifyOutputsUnknown` (the `amplify_outputs.json` shape). The scopes correspond to the top-level keys in the schema: `auth`, `storage`, `data`, `analytics`, `geo`, `notifications`, `custom`.

### Step 2.2 — Implement `createConfigurationBuilder()`

**Location:** `packages/core/src/configurationBuilder/index.ts`

Fluent API:

```ts
const config = createConfigurationBuilder()
  .auth({ user_pool_id: 'us-east-1_abc', user_pool_client_id: 'xyz', aws_region: 'us-east-1' })
  .storage({ bucket_name: 'my-bucket', aws_region: 'us-east-1' })
  .data({ url: 'https://xxx.appsync-api.us-east-1.amazonaws.com/graphql', aws_region: 'us-east-1', default_authorization_type: 'API_KEY', authorization_types: ['API_KEY'], api_key: 'da2-xxx' })
  .analytics({ amazon_pinpoint: { app_id: 'xxx', aws_region: 'us-east-1' } })
  .build();

// config is a valid amplify_outputs.json object — pass it to configure()
const ctx = configure(config);
```

Each scope method accepts the corresponding schema type (e.g. `.auth()` accepts `AmplifyOutputsAuthProperties`). Calling a scope method multiple times replaces the previous value for that scope (enabling reconfiguration).

`.build()` returns a frozen object with `version: '1.4'` and all configured scopes.

### Step 2.3 — Export from `@aws-amplify/core`

```ts
export { createConfigurationBuilder } from './configurationBuilder';
```

### Step 2.4 — Re-export from `aws-amplify`

```ts
export { createConfigurationBuilder } from '@aws-amplify/core';
```

### Verification

- `createConfigurationBuilder().auth({...}).build()` produces valid `amplify_outputs.json` structure.
- Output is accepted by `configure()` and `parseAmplifyOutputs()`.
- Reconfiguration: calling `.auth()` twice replaces the first auth config.
- Unit test: round-trip builder → `configure()` → `ctx.resourcesConfig` contains expected values.

---

## Phase 3: Refactor Category Internals to Accept `AmplifyContext`

**Goal:** Make internal functions accept `AmplifyContext` instead of `AmplifyClassV6`. Most already accept an amplify-like object as first param — this is primarily a type change.

### Step 3.1 — Core: Create compatibility layer

**Location:** `packages/core/src/singleton/`

The internal functions currently depend on `AmplifyClassV6` which has methods like `.getConfig()` and properties like `.Auth` and `.libraryOptions`. Create a type alias or adapter so `AmplifyContext` satisfies the same contract:

- `amplify.getConfig()` → `ctx.resourcesConfig` (add a helper or update call sites)
- `amplify.Auth.fetchAuthSession()` → `ctx.fetchAuthSession()`
- `amplify.libraryOptions` → `ctx.libraryOptions`

Decision: either update all internal call sites, or provide a thin wrapper. Updating call sites is preferred for a clean break.

### Step 3.2 — Storage: Update internal functions

Files to update (representative, not exhaustive):

- `packages/storage/src/providers/s3/utils/resolveS3ConfigAndInput.ts` — change `amplify: AmplifyClassV6` → `amplify: AmplifyContext`, update `amplify.getConfig()` → `amplify.resourcesConfig`, `amplify.Auth.fetchAuthSession()` → `amplify.fetchAuthSession()`
- `packages/storage/src/providers/s3/apis/internal/*.ts` — same pattern
- `packages/storage/src/internals/apis/listPaths/listPaths.ts` — currently imports `Amplify` directly, change to accept context param

### Step 3.3 — Auth: Update internal functions

Files to update:

- `packages/auth/src/providers/cognito/apis/*.ts` — these currently import `Amplify` from core. Change to accept `AmplifyContext` as first param.
- `packages/core/src/singleton/apis/fetchAuthSession.ts` — this is the top-level `fetchAuthSession()` that delegates to `Amplify.Auth`. Refactor to accept context.

### Step 3.4 — Remaining categories

Apply the same pattern to each:

- `packages/analytics/src/providers/*/apis/*.ts`
- `packages/api-graphql/src/internals/*.ts`
- `packages/api-rest/src/apis/*.ts`
- `packages/geo/src/providers/*/apis/*.ts`
- `packages/notifications/src/*/apis/*.ts`
- `packages/predictions/src/providers/*/apis/*.ts`
- `packages/interactions/src/*/apis/*.ts`
- `packages/pubsub/src/*.ts`
- `packages/datastore/src/*.ts`

For each category:

1. Find all imports of `Amplify` from `@aws-amplify/core`.
2. Replace with `AmplifyContext` parameter.
3. Update `amplify.getConfig()` → `amplify.resourcesConfig`.
4. Update `amplify.Auth.*` → `amplify.fetchAuthSession()` / `amplify.getTokens()` / `amplify.clearCredentials()`.
5. Update `amplify.libraryOptions` (no change needed if property name stays).

### Verification

- All internal functions accept `AmplifyContext`.
- No internal function imports the `Amplify` singleton directly.
- Existing public APIs still work (they still pass the singleton, which can be adapted).

---

## Phase 4: Update Public APIs

**Goal:** Change every category's public-facing functions to accept `AmplifyContext` as first argument.

### Step 4.1 — Storage public APIs

**Location:** `packages/storage/src/providers/s3/apis/*.ts`

Before:

```ts
export function getProperties(input: GetPropertiesWithPathInput) {
  return getPropertiesInternal(Amplify, input);
}
```

After:

```ts
export function getProperties(ctx: AmplifyContext, input: GetPropertiesWithPathInput) {
  return getPropertiesInternal(ctx, input);
}
```

Apply to: `uploadData`, `downloadData`, `remove`, `list`, `getProperties`, `copy`, `getUrl`.

Update `packages/storage/src/index.ts` exports accordingly.

### Step 4.2 — Auth public APIs

**Location:** `packages/auth/src/providers/cognito/apis/*.ts`

Apply same pattern to: `signIn`, `signUp`, `signOut`, `confirmSignIn`, `confirmSignUp`, `resetPassword`, `confirmResetPassword`, `getCurrentUser`, `fetchUserAttributes`, `fetchMFAPreference`, `updateMFAPreference`, `updatePassword`, `setUpTOTP`, `verifyTOTPSetup`, `updateUserAttributes`, `deleteUser`, `fetchDevices`, `rememberDevice`, `forgetDevice`, `resendSignUpCode`, `sendUserAttributeVerificationCode`, `confirmUserAttribute`, `deleteUserAttributes`, `signInWithRedirect`, `autoSignIn`, `associateWebAuthnCredential`, `listWebAuthnCredentials`, `deleteWebAuthnCredential`.

Also update the top-level `fetchAuthSession` export from core.

### Step 4.3 — Remaining category public APIs

Apply the same `(ctx, input)` pattern to:

- `packages/analytics/src/providers/*/apis/*.ts`
- `packages/api-graphql/src/apis/*.ts`
- `packages/api-rest/src/apis/*.ts`
- `packages/geo/src/providers/*/apis/*.ts`
- `packages/notifications/src/*/apis/*.ts`
- `packages/predictions/src/providers/*/apis/*.ts`
- `packages/interactions/src/*/apis/*.ts`

### Step 4.4 — Update `aws-amplify` re-exports

**Location:** `packages/aws-amplify/src/`

The `aws-amplify` package re-exports category APIs via subpath exports (e.g. `aws-amplify/storage`). Update these to re-export the new signatures.

### Verification

- Every public API function takes `AmplifyContext` as first param.
- `grep -r "import.*Amplify.*from '@aws-amplify/core'" packages/` returns zero hits in category packages (only in core itself).

---

## Phase 5: Update Framework Adapters

**Goal:** Ensure `adapter-nextjs` and server-side patterns work with the new model.

### Step 5.1 — Update `adapter-nextjs`

**Location:** `packages/adapter-nextjs/src/`

The Next.js adapter currently uses `createServerRunner` which relies on the singleton for server context. Refactor to:

1. Accept `AmplifyContext` (or the raw config) as input.
2. Return server-scoped context per request instead of relying on global state.

### Step 5.2 — Update server subpath exports

Categories with `/server` subpath exports (`storage/server`, `auth/server`, `api-rest/server`, `api-graphql/server`) need the same treatment — accept context explicitly.

### Verification

- Next.js adapter works with `configure()` return value.
- Server-side APIs accept context per-request.

---

## Phase 6: Remove the Singleton

**Goal:** Delete all singleton infrastructure now that nothing depends on it.

### Step 6.1 — Remove `AmplifyClass` and singleton export

Delete or gut:

- `packages/core/src/singleton/Amplify.ts` — remove `AmplifyClass` and `Amplify` instance export
- `packages/core/src/singleton/index.ts` — remove singleton re-exports
- `packages/core/src/index.ts` — remove `Amplify`, `AmplifyClassV6` exports

### Step 6.2 — Remove `DefaultAmplify` wrapper

Delete:

- `packages/aws-amplify/src/initSingleton.ts`

Update `packages/aws-amplify/src/index.ts` to only export `configure` (not `Amplify`).

### Step 6.3 — Clean up Hub config events

The singleton currently dispatches Hub events on configure. Decide:

- **Option A:** Remove Hub entirely (if unused outside config events).
- **Option B:** Keep Hub but make it opt-in / passed via `libraryOptions`.

### Step 6.4 — Remove dead code

Search for and remove:

- Any remaining references to `AmplifyClassV6`
- The `ADD_OAUTH_LISTENER` / `oAuthListener` pattern on the singleton
- `isConfigured` flag logic

### Verification

- `grep -r "AmplifyClass\|new Amplify\|Amplify\.configure" packages/` returns zero hits.
- Full build passes.
- All existing unit tests updated and passing.

---

## Phase 7: Validation

### Step 7.1 — Build all packages

```
yarn build
```

### Step 7.2 — Run all unit tests

```
yarn test
```

### Step 7.3 — Bundle size check

Compare bundle sizes before/after for each category to confirm no regression. The expectation is equal or smaller bundles since the singleton class is removed.

### Step 7.4 — Tree-shaking verification

Create a minimal app that imports only `configure` + one category function (e.g. `uploadData`). Verify the bundle does not include code from other categories.

### Step 7.5 — Integration smoke test

Write a minimal integration test:

```ts
import { configure } from 'aws-amplify';
import { uploadData } from 'aws-amplify/storage';
import outputs from './amplify_outputs.json';

const ctx = configure(outputs);
await uploadData(ctx, { path: 'test.txt', data: 'hello' });
```

---

## Dependency Chain Reference

After refactor, the dependency graph is explicit through the `AmplifyContext` type:

| Category | Reads from `ctx.resourcesConfig` | Uses `ctx.fetchAuthSession` |
|---|---|---|
| auth | `.Auth` | Yes (is the provider) |
| storage | `.Storage` | Yes (credentials) |
| api-graphql | `.API` | Yes (credentials + tokens) |
| api-rest | `.API` | Yes (credentials) |
| analytics | `.Analytics` | Yes (credentials) |
| geo | `.Geo` | Yes (credentials) |
| notifications | `.Notifications` | Yes (credentials) |
| predictions | `.Predictions` | Yes (credentials) |
| interactions | `.Interactions` | Yes (credentials) |
| pubsub | `.API` | Yes (credentials + tokens) |
| datastore | `.API`, `.Auth` | Yes (credentials + tokens) |

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Large blast radius — every public API signature changes | Phase the work: internals first (Phase 2), then public APIs (Phase 3), then cleanup (Phase 5) |
| Customers must update all call sites | Provide a codemod / migration script that adds `ctx` as first arg |
| Hub listeners break | Document in migration guide; provide alternative if needed |
| Server-side (Next.js) adapter complexity | Dedicated phase (Phase 4) with its own verification |
| Bundle size regression | Explicit verification step (Phase 6.3) |
