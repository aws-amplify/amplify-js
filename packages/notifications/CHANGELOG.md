# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.6.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.5.0...@aws-amplify/notifications@1.6.0) (2023-07-31)

### Features

- custom user agent Geo changes for UI handoff ([#11632](https://github.com/aws-amplify/amplify-js/issues/11632)) ([01bfa8f](https://github.com/aws-amplify/amplify-js/commit/01bfa8f692737bd14422f7dc2eae11ed00c19048))
- custom user agent InAppMessaging changes for UI handoff ([#11639](https://github.com/aws-amplify/amplify-js/issues/11639)) ([4d389da](https://github.com/aws-amplify/amplify-js/commit/4d389da22c9f39d5a5d7cd6df9116327a9d6a04e))

# [1.5.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.4.0...@aws-amplify/notifications@1.5.0) (2023-07-20)

### Features

- custom user agent core changes for UI handoff ([#11602](https://github.com/aws-amplify/amplify-js/issues/11602)) ([7365c34](https://github.com/aws-amplify/amplify-js/commit/7365c34b28015af199dbfdb3713cc26e096d1213))

# [1.4.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.3.2...@aws-amplify/notifications@1.4.0) (2023-07-13)

### Bug Fixes

- **storage:** custom client base64 encoded SSE-C headers ([#11567](https://github.com/aws-amplify/amplify-js/issues/11567)) ([ee19046](https://github.com/aws-amplify/amplify-js/commit/ee190460c01250b693c163f83be412abf3acc234))

### Features

- **s3:** omit double encoding of path for S3 when signing ([#11538](https://github.com/aws-amplify/amplify-js/issues/11538)) ([d46d2d1](https://github.com/aws-amplify/amplify-js/commit/d46d2d1d4263e3b8bcfc03af473d7445af12e5b7))

## [1.3.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.3.1...@aws-amplify/notifications@1.3.2) (2023-06-28)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.3.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.3.0...@aws-amplify/notifications@1.3.1) (2023-06-21)

### Bug Fixes

- Update getAmplifyUserAgent to retain original interface ([#11535](https://github.com/aws-amplify/amplify-js/issues/11535)) ([dc84cc8](https://github.com/aws-amplify/amplify-js/commit/dc84cc8bfa7811b5f4f8ac2f7e5ea1b5edc54fe1))

# [1.3.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.2.0...@aws-amplify/notifications@1.3.0) (2023-06-20)

### Bug Fixes

- Add upkeep to platform/framework caches ([#11505](https://github.com/aws-amplify/amplify-js/issues/11505)) ([03aa356](https://github.com/aws-amplify/amplify-js/commit/03aa3560e921f08717594bdf679b62501bc6de77))
- **storage:** Add getProperties user agent action ([#11501](https://github.com/aws-amplify/amplify-js/issues/11501)) ([019b5b1](https://github.com/aws-amplify/amplify-js/commit/019b5b1115bebc92f2c44bbf285d1d916cb08492))

### Features

- **core:** API detection for 8 framework targets ([#11384](https://github.com/aws-amplify/amplify-js/issues/11384)) ([388f207](https://github.com/aws-amplify/amplify-js/commit/388f2074db0640f2d22aa7cd1a44d8eb8f2301d2))

# [1.2.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.1.7...@aws-amplify/notifications@1.2.0) (2023-06-05)

### Bug Fixes

- address feedbacks ([2d6eecf](https://github.com/aws-amplify/amplify-js/commit/2d6eecfa4763a6cfb6aeaabedd49a530c6420dcd))

### Features

- **clients:** cognito identity client ([#11213](https://github.com/aws-amplify/amplify-js/issues/11213)) ([67e4017](https://github.com/aws-amplify/amplify-js/commit/67e40171385f02d0c9448fdc3e036d63e009ea34))
- **clients:** support CN partition by adding DNS suffix resolver ([#11311](https://github.com/aws-amplify/amplify-js/issues/11311)) ([9de2975](https://github.com/aws-amplify/amplify-js/commit/9de297519fdbaaf1e9b4ae98f12aed4137400222))
- **clients:** vendor TS types from pinpoint and cognito-identity clients ([#11393](https://github.com/aws-amplify/amplify-js/issues/11393)) ([9a8569a](https://github.com/aws-amplify/amplify-js/commit/9a8569ab98480ad96b53a7104366640c66343aa2))

## [1.1.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.1.6...@aws-amplify/notifications@1.1.7) (2023-05-27)

### Bug Fixes

- **core:** bundle react-native-url-polyfill to unblock jest test failure ([#11422](https://github.com/aws-amplify/amplify-js/issues/11422)) ([8137ee7](https://github.com/aws-amplify/amplify-js/commit/8137ee79ef2121ceaa6dfa1d9ce675370b38e26b))
- **notifications:** Add babel plugins to devDependencies ([#11414](https://github.com/aws-amplify/amplify-js/issues/11414)) ([a009ce8](https://github.com/aws-amplify/amplify-js/commit/a009ce8afe52ca1f2e070cf40b8eb581132b6fdd))

## [1.1.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.1.5...@aws-amplify/notifications@1.1.6) (2023-05-12)

### Bug Fixes

- **core:** add URL polyfill for signer in react native ([#11362](https://github.com/aws-amplify/amplify-js/issues/11362)) ([720ac60](https://github.com/aws-amplify/amplify-js/commit/720ac606dede7d243f3d5ce08395fc6387a6f35d))

## [1.1.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.1.4...@aws-amplify/notifications@1.1.5) (2023-05-04)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.1.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.1.3...@aws-amplify/notifications@1.1.4) (2023-04-27)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.1.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.1.2...@aws-amplify/notifications@1.1.3) (2023-04-20)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.1.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.1.1...@aws-amplify/notifications@1.1.2) (2023-04-18)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.1.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.1.0...@aws-amplify/notifications@1.1.1) (2023-04-13)

### Bug Fixes

- **notifications:** Fix permissions type ([#11237](https://github.com/aws-amplify/amplify-js/issues/11237)) ([7fe7d4e](https://github.com/aws-amplify/amplify-js/commit/7fe7d4ea9f638547cc7199cf8d02ac561d8bd7b1))

# [1.1.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.25...@aws-amplify/notifications@1.1.0) (2023-04-12)

### Bug Fixes

- **notifications:** Fix double registration issue ([#11155](https://github.com/aws-amplify/amplify-js/issues/11155)) ([772b561](https://github.com/aws-amplify/amplify-js/commit/772b561d2d6c6aed57aa9464c34a4d87da3f85d2))
- **notifications:** Fix typing for onTokenReceived ([#11147](https://github.com/aws-amplify/amplify-js/issues/11147)) ([173fb37](https://github.com/aws-amplify/amplify-js/commit/173fb3752908221930a0b7363a54bdb3609eaf3f))
- **notifications:** Surface missing native module error ([#11208](https://github.com/aws-amplify/amplify-js/issues/11208)) ([c3d2738](https://github.com/aws-amplify/amplify-js/commit/c3d2738e6c684b177b63095daa0ff20bf384fa05))

### Features

- **notifications:** Add badge count APIs ([#11037](https://github.com/aws-amplify/amplify-js/issues/11037)) ([9a58db9](https://github.com/aws-amplify/amplify-js/commit/9a58db97a91c8429e150ada8c03d650a9f3ddb77))
- **notifications:** Add getPermissionStatus API ([#10979](https://github.com/aws-amplify/amplify-js/issues/10979)) ([80f86a7](https://github.com/aws-amplify/amplify-js/commit/80f86a79b96c23f0c21ba3ae7f611f3904d59437))
- **notifications:** Add init API ([#11067](https://github.com/aws-amplify/amplify-js/issues/11067)) ([fbdc1d5](https://github.com/aws-amplify/amplify-js/commit/fbdc1d519ce3521432011369328beaf17b281fc6))
- **notifications:** Add Notifications-level identifyUser ([#11010](https://github.com/aws-amplify/amplify-js/issues/11010)) ([8325cc7](https://github.com/aws-amplify/amplify-js/commit/8325cc72d4eaeb60b973fee2b979960d9daf9857))
- **notifications:** Add Push Notification ([#10972](https://github.com/aws-amplify/amplify-js/issues/10972)) ([97acab6](https://github.com/aws-amplify/amplify-js/commit/97acab69c6452c860af1f45fbcfda8fd80c26ca3))

## [1.0.25](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.24...@aws-amplify/notifications@1.0.25) (2023-04-06)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.24](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.23...@aws-amplify/notifications@1.0.24) (2023-04-04)

### Bug Fixes

- **deps:** update AWS SDK clients with fast-xml-parser dependency ([#11181](https://github.com/aws-amplify/amplify-js/issues/11181)) ([a05e1dd](https://github.com/aws-amplify/amplify-js/commit/a05e1dd9da7fb7a65f1ad1c78886e095e21a5c5a))

## [1.0.23](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.22...@aws-amplify/notifications@1.0.23) (2023-03-30)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.22](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.21...@aws-amplify/notifications@1.0.22) (2023-03-23)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.21](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.20...@aws-amplify/notifications@1.0.21) (2023-03-21)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.20](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.19...@aws-amplify/notifications@1.0.20) (2023-03-16)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.19](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.18...@aws-amplify/notifications@1.0.19) (2023-03-13)

### Bug Fixes

- Run ts coverage check with test ([#11047](https://github.com/aws-amplify/amplify-js/issues/11047)) ([430bedf](https://github.com/aws-amplify/amplify-js/commit/430bedfd0d0618bd0093b488233521356feef787))

## [1.0.18](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.17...@aws-amplify/notifications@1.0.18) (2023-03-08)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.17](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.16...@aws-amplify/notifications@1.0.17) (2023-03-06)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.16](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.15...@aws-amplify/notifications@1.0.16) (2023-02-24)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.15](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.14...@aws-amplify/notifications@1.0.15) (2023-02-16)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.14](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.13...@aws-amplify/notifications@1.0.14) (2023-02-09)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.13](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.12...@aws-amplify/notifications@1.0.13) (2023-02-08)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.12](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.11...@aws-amplify/notifications@1.0.12) (2023-01-30)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.10...@aws-amplify/notifications@1.0.11) (2023-01-19)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.9...@aws-amplify/notifications@1.0.10) (2023-01-13)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.8...@aws-amplify/notifications@1.0.9) (2023-01-10)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.7...@aws-amplify/notifications@1.0.8) (2022-12-27)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.6...@aws-amplify/notifications@1.0.7) (2022-12-16)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.5...@aws-amplify/notifications@1.0.6) (2022-12-15)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.4...@aws-amplify/notifications@1.0.5) (2022-12-06)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.3...@aws-amplify/notifications@1.0.4) (2022-11-23)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.2...@aws-amplify/notifications@1.0.3) (2022-11-19)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.1...@aws-amplify/notifications@1.0.2) (2022-11-16)

**Note:** Version bump only for package @aws-amplify/notifications

## [1.0.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/notifications@1.0.0...@aws-amplify/notifications@1.0.1) (2022-11-11)

**Note:** Version bump only for package @aws-amplify/notifications

# 1.0.0 (2022-11-09)

### Features

- First release of the `notifications` category ([#10430](https://github.com/aws-amplify/amplify-js/pull/10430))
