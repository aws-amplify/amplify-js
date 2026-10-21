# Change Log

## 1.2.0

### Minor Changes

- [#14966](https://github.com/aws-amplify/amplify-js/pull/14966) [`50eccce`](https://github.com/aws-amplify/amplify-js/commit/50eccce3099dc6060fdea507a9be49077a873b38) Thanks [@osama-rizk](https://github.com/osama-rizk)! - chore: raise the minimum supported React Native version to 0.81

  Minimum supported react-native is now 0.81 (aligned with the oldest Expo SDK still supported, SDK 54). Per the Amplify maintenance policy this is shipped as a minor.

- [#14966](https://github.com/aws-amplify/amplify-js/pull/14966) [`50eccce`](https://github.com/aws-amplify/amplify-js/commit/50eccce3099dc6060fdea507a9be49077a873b38) Thanks [@osama-rizk](https://github.com/osama-rizk)! - fix(rtn-passkeys): support React Native 0.81 through 0.87
  - Fix the Android build on React Native 0.82+ (the removed `JSONArguments` API is replaced with an internal converter, and `currentActivity` is read from the React context).
  - Stop shipping pre-generated codegen output. Apps now generate the native spec with their own React Native version, which avoids mismatches between the bundled code and newer React Native releases.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.1.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/rtn-passkeys@1.1.1...@aws-amplify/rtn-passkeys@1.1.2) (2026-02-05)

**Note:** Version bump only for package @aws-amplify/rtn-passkeys

## [1.1.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/rtn-passkeys@1.1.0...@aws-amplify/rtn-passkeys@1.1.1) (2025-12-10)

**Note:** Version bump only for package @aws-amplify/rtn-passkeys

# 1.1.0 (2025-09-29)

### Features

- **rtn-passkeys:** add rtn passkeys ([#14489](https://github.com/aws-amplify/amplify-js/issues/14489)) ([ac06885](https://github.com/aws-amplify/amplify-js/commit/ac06885a8f2a13365fe1ff26bfd54891f9ad4a45)), closes [#14390](https://github.com/aws-amplify/amplify-js/issues/14390) [#14391](https://github.com/aws-amplify/amplify-js/issues/14391)
