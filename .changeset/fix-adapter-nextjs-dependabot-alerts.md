---
'@aws-amplify/adapter-nextjs': patch
---

fix(adapter-nextjs): bump next devDependency to ^16.3.4 to remediate Dependabot alerts

Pins the `next` devDependency in `@aws-amplify/adapter-nextjs` to `^16.3.4` (resolves to 16.3.5), closing two critical `next` alerts (< 16.3.3) and pulling in `sharp@^0.35.4` via next's optional dependency. The published `peerDependency` range (`>=13.5.0 <17.0.0`) is intentionally left unchanged, so consumer compatibility is unaffected. Root-level lockfile upgrades additionally move `js-yaml` to 4.3.2, `joi` to 18.2.9, `sharp` to 0.35.4, and `baseline-browser-mapping` to 2.11.20, with no new `resolutions` or overrides.
