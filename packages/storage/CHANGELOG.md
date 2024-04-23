# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.28](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@6.0.27...@aws-amplify/storage@6.0.28) (2024-04-22)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.27 (2024-04-02)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.26 (2024-04-01)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.25 (2024-03-30)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.24 (2024-03-29)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.23 (2024-03-25)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.22 (2024-03-25)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.21 (2024-03-19)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.20 (2024-03-11)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.19 (2024-03-05)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.18 (2024-02-27)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.17 (2024-02-19)

### Reverts

- Revert "chore(release): Publish" (#13027) ([f6f4f42](https://github.com/aws-amplify/amplify-js/commit/f6f4f42befa04ed3c1502fa0adf17c6700abfddf)), closes [#13027](https://github.com/aws-amplify/amplify-js/issues/13027)

## 6.0.16 (2024-02-09)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.15 (2024-02-06)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.14 (2024-02-01)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.13 (2024-01-22)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.12 (2024-01-12)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.11 (2024-01-10)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.10 (2024-01-04)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.9 (2023-12-22)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.8 (2023-12-18)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.7 (2023-12-12)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.6 (2023-12-05)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.5 (2023-11-22)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.4 (2023-11-20)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.3 (2023-11-16)

**Note:** Version bump only for package @aws-amplify/storage

## 6.0.2 (2023-11-13)

**Note:** Version bump only for package @aws-amplify/storage

## 5.9.4 (2023-08-23)

**Note:** Version bump only for package @aws-amplify/storage

## 5.9.3 (2023-08-22)

**Note:** Version bump only for package @aws-amplify/storage

## 5.9.2 (2023-08-17)

**Note:** Version bump only for package @aws-amplify/storage

## 5.9.1 (2023-08-10)

**Note:** Version bump only for package @aws-amplify/storage

# [5.9.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.8.0...@aws-amplify/storage@5.9.0) (2023-07-31)

### Features

- custom user agent Geo changes for UI handoff ([#11632](https://github.com/aws-amplify/amplify-js/issues/11632)) ([01bfa8f](https://github.com/aws-amplify/amplify-js/commit/01bfa8f692737bd14422f7dc2eae11ed00c19048))
- custom user agent Storage changes for UI handoff ([#11627](https://github.com/aws-amplify/amplify-js/issues/11627)) ([b0231af](https://github.com/aws-amplify/amplify-js/commit/b0231af9d7fe631ef9e0e669df7a20802e3a21b3)), closes [#11656](https://github.com/aws-amplify/amplify-js/issues/11656) [#11657](https://github.com/aws-amplify/amplify-js/issues/11657)

# [5.8.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.7.0...@aws-amplify/storage@5.8.0) (2023-07-20)

### Features

- **storage:** supporting put api when the objectLock is enabled ([#11611](https://github.com/aws-amplify/amplify-js/issues/11611)) ([817a08c](https://github.com/aws-amplify/amplify-js/commit/817a08c8b36efbe103ca2dd25cf65d5369418a4c))

# [5.7.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.6.3...@aws-amplify/storage@5.7.0) (2023-07-13)

### Bug Fixes

- **s3:** add missing default content-type & support body.text() in RN & optimize retry ([#11537](https://github.com/aws-amplify/amplify-js/issues/11537)) ([33d858d](https://github.com/aws-amplify/amplify-js/commit/33d858d8d0ea112822e8b8289fc15761a053301d))
- **storage:** custom client base64 encoded SSE-C headers ([#11567](https://github.com/aws-amplify/amplify-js/issues/11567)) ([ee19046](https://github.com/aws-amplify/amplify-js/commit/ee190460c01250b693c163f83be412abf3acc234))
- **storage:** fail to avoid double signing for presigned URL ([cf51899](https://github.com/aws-amplify/amplify-js/commit/cf51899bee30de86ee9ea583e7cd9225ebcf2dfe))
- **storage:** missing Size in listParts output ([679d78a](https://github.com/aws-amplify/amplify-js/commit/679d78a3f36fa995a787afb9c802720025e7ef69))
- **storage:** multipart upload cannot complete ([0175d3d](https://github.com/aws-amplify/amplify-js/commit/0175d3d358bcdf1a5e39bc862f383ed3d44d6135))
- **storage:** not pass the input to SSE-C serializer output ([#11607](https://github.com/aws-amplify/amplify-js/issues/11607)) ([28bc873](https://github.com/aws-amplify/amplify-js/commit/28bc8739ed6e6e941f893c2d7cf1354ebd65ba9d))
- **storage:** vault uploads with public level with multipart upload ([416d797](https://github.com/aws-amplify/amplify-js/commit/416d797b0ab2e538bef37b7eb33851c7774ad6b9))

### Features

- **s3:** add s3 transfer handler ([#11482](https://github.com/aws-amplify/amplify-js/issues/11482)) ([53aa94f](https://github.com/aws-amplify/amplify-js/commit/53aa94f95a3959d5e490b17d91c9b65b52847359))
- **s3:** custom xhr transfer handler ([#11471](https://github.com/aws-amplify/amplify-js/issues/11471)) ([e1f2ca1](https://github.com/aws-amplify/amplify-js/commit/e1f2ca11f0179e51126e42360de19169ffc7c6e2))
- **s3:** dom based xml parser ([#11300](https://github.com/aws-amplify/amplify-js/issues/11300)) ([f54b603](https://github.com/aws-amplify/amplify-js/commit/f54b603991200ca37cfabd1629f6c5584227e5a8))
- **s3:** implement listObjectsV2 ([#11504](https://github.com/aws-amplify/amplify-js/issues/11504)) ([0c43bb3](https://github.com/aws-amplify/amplify-js/commit/0c43bb3c3eaff0ed287953b44186a82da9169cd4))
- **s3:** implement multiparts upload APIs ([#11514](https://github.com/aws-amplify/amplify-js/issues/11514)) ([835b74f](https://github.com/aws-amplify/amplify-js/commit/835b74fa15a143f7490ffcfb7f5811594d5c5a8e))
- **s3:** implement putObject ([#11513](https://github.com/aws-amplify/amplify-js/issues/11513)) ([9efe09a](https://github.com/aws-amplify/amplify-js/commit/9efe09a3c13a4b51cdd8d8bd1f24599aeb3760e2))
- **s3:** omit double encoding of path for S3 when signing ([#11538](https://github.com/aws-amplify/amplify-js/issues/11538)) ([d46d2d1](https://github.com/aws-amplify/amplify-js/commit/d46d2d1d4263e3b8bcfc03af473d7445af12e5b7))
- **s3:** support copy/delete/get/head object APIs ([#11515](https://github.com/aws-amplify/amplify-js/issues/11515)) ([3e2c1a9](https://github.com/aws-amplify/amplify-js/commit/3e2c1a94ddcc3cfea1db81ca6a5c3b8075e738b8))
- **storage:** integrate custom s3 client ([#11542](https://github.com/aws-amplify/amplify-js/issues/11542)) ([fe05494](https://github.com/aws-amplify/amplify-js/commit/fe05494c75ab6d1561863f4dfaf1107bc1f256a6))

## [5.6.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.6.2...@aws-amplify/storage@5.6.3) (2023-06-28)

**Note:** Version bump only for package @aws-amplify/storage

## [5.6.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.6.1...@aws-amplify/storage@5.6.2) (2023-06-27)

**Note:** Version bump only for package @aws-amplify/storage

## [5.6.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.6.0...@aws-amplify/storage@5.6.1) (2023-06-21)

### Bug Fixes

- Update getAmplifyUserAgent to retain original interface ([#11535](https://github.com/aws-amplify/amplify-js/issues/11535)) ([dc84cc8](https://github.com/aws-amplify/amplify-js/commit/dc84cc8bfa7811b5f4f8ac2f7e5ea1b5edc54fe1))

# [5.6.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.5.0...@aws-amplify/storage@5.6.0) (2023-06-20)

### Bug Fixes

- Storage action enum update ([82a96c9](https://github.com/aws-amplify/amplify-js/commit/82a96c9804797891a2b604ae3d6c82ea48f0a18c))
- **storage:** Add getProperties user agent action ([#11501](https://github.com/aws-amplify/amplify-js/issues/11501)) ([019b5b1](https://github.com/aws-amplify/amplify-js/commit/019b5b1115bebc92f2c44bbf285d1d916cb08492))

### Features

- **core:** API detection for 8 framework targets ([#11384](https://github.com/aws-amplify/amplify-js/issues/11384)) ([388f207](https://github.com/aws-amplify/amplify-js/commit/388f2074db0640f2d22aa7cd1a44d8eb8f2301d2))
- Custom user agent improvements for Storage ([#11425](https://github.com/aws-amplify/amplify-js/issues/11425)) ([fd04df4](https://github.com/aws-amplify/amplify-js/commit/fd04df40b6a07a864e2ded443a53f3efdf74931f))
- user agent enhancements: part1 core ([#11121](https://github.com/aws-amplify/amplify-js/issues/11121)) ([66d1fb5](https://github.com/aws-amplify/amplify-js/commit/66d1fb5a7c3d82621ce9a8c1e880fe81573387ba))

# [5.5.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.4.1...@aws-amplify/storage@5.5.0) (2023-06-15)

### Features

- **storage:** add getProperties API ([#11469](https://github.com/aws-amplify/amplify-js/issues/11469)) ([f47d472](https://github.com/aws-amplify/amplify-js/commit/f47d472ea021dadb1a04d03295c3c6065155f0c0))

## [5.4.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.4.0...@aws-amplify/storage@5.4.1) (2023-06-14)

**Note:** Version bump only for package @aws-amplify/storage

# [5.4.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.3.1...@aws-amplify/storage@5.4.0) (2023-06-05)

### Features

- **clients:** support CN partition by adding DNS suffix resolver ([#11311](https://github.com/aws-amplify/amplify-js/issues/11311)) ([9de2975](https://github.com/aws-amplify/amplify-js/commit/9de297519fdbaaf1e9b4ae98f12aed4137400222))

## [5.3.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.3.0...@aws-amplify/storage@5.3.1) (2023-05-27)

### Reverts

- Revert "feat(storage): getProperties API (#11378)" ([7179636](https://github.com/aws-amplify/amplify-js/commit/7179636b183282c299304501cb5aad2cee942a86)), closes [#11378](https://github.com/aws-amplify/amplify-js/issues/11378)

# [5.3.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.2.6...@aws-amplify/storage@5.3.0) (2023-05-25)

### Features

- **storage:** getProperties API ([#11378](https://github.com/aws-amplify/amplify-js/issues/11378)) ([3bed12b](https://github.com/aws-amplify/amplify-js/commit/3bed12b6960c676095689ee895c60ae55a041c8c))

## [5.2.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.2.5...@aws-amplify/storage@5.2.6) (2023-05-12)

**Note:** Version bump only for package @aws-amplify/storage

## [5.2.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.2.4...@aws-amplify/storage@5.2.5) (2023-05-04)

**Note:** Version bump only for package @aws-amplify/storage

## [5.2.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.2.3...@aws-amplify/storage@5.2.4) (2023-04-27)

**Note:** Version bump only for package @aws-amplify/storage

## [5.2.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.2.2...@aws-amplify/storage@5.2.3) (2023-04-20)

**Note:** Version bump only for package @aws-amplify/storage

## [5.2.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.2.1...@aws-amplify/storage@5.2.2) (2023-04-18)

**Note:** Version bump only for package @aws-amplify/storage

## [5.2.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.2.0...@aws-amplify/storage@5.2.1) (2023-04-13)

**Note:** Version bump only for package @aws-amplify/storage

# [5.2.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.15...@aws-amplify/storage@5.2.0) (2023-04-12)

### Features

- **storage:** add validateObjectExistence option in Get API ([#11154](https://github.com/aws-amplify/amplify-js/issues/11154)) ([8005225](https://github.com/aws-amplify/amplify-js/commit/8005225b929a2cef50fd55d6e67b9057f58868fc))

## [5.1.15](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.14...@aws-amplify/storage@5.1.15) (2023-04-06)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.14](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.13...@aws-amplify/storage@5.1.14) (2023-04-04)

### Bug Fixes

- **deps:** update AWS SDK clients with fast-xml-parser dependency ([#11181](https://github.com/aws-amplify/amplify-js/issues/11181)) ([a05e1dd](https://github.com/aws-amplify/amplify-js/commit/a05e1dd9da7fb7a65f1ad1c78886e095e21a5c5a))

## [5.1.13](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.12...@aws-amplify/storage@5.1.13) (2023-03-30)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.12](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.11...@aws-amplify/storage@5.1.12) (2023-03-23)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.10...@aws-amplify/storage@5.1.11) (2023-03-21)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.9...@aws-amplify/storage@5.1.10) (2023-03-16)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.8...@aws-amplify/storage@5.1.9) (2023-03-13)

### Bug Fixes

- Run ts coverage check with test ([#11047](https://github.com/aws-amplify/amplify-js/issues/11047)) ([430bedf](https://github.com/aws-amplify/amplify-js/commit/430bedfd0d0618bd0093b488233521356feef787))

## [5.1.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.7...@aws-amplify/storage@5.1.8) (2023-03-08)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.6...@aws-amplify/storage@5.1.7) (2023-03-06)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.5...@aws-amplify/storage@5.1.6) (2023-02-24)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.4...@aws-amplify/storage@5.1.5) (2023-02-16)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.3...@aws-amplify/storage@5.1.4) (2023-02-09)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.2...@aws-amplify/storage@5.1.3) (2023-02-08)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.1...@aws-amplify/storage@5.1.2) (2023-01-30)

**Note:** Version bump only for package @aws-amplify/storage

## [5.1.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.1.0...@aws-amplify/storage@5.1.1) (2023-01-19)

**Note:** Version bump only for package @aws-amplify/storage

# [5.1.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.9...@aws-amplify/storage@5.1.0) (2023-01-13)

### Bug Fixes

- Remove unhandled promise rejection for \_verifyFileSize() ([#9763](https://github.com/aws-amplify/amplify-js/issues/9763)) ([c9032bf](https://github.com/aws-amplify/amplify-js/commit/c9032bfdf7c15ab58cfa26654644a8fdaec899f7))

### Features

- **storage:** auto double part size when body exceeds 10k parts ([#10820](https://github.com/aws-amplify/amplify-js/issues/10820)) ([f895f78](https://github.com/aws-amplify/amplify-js/commit/f895f78360251cf13d063757d58b366563c7efc5))

## [5.0.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.8...@aws-amplify/storage@5.0.9) (2023-01-10)

**Note:** Version bump only for package @aws-amplify/storage

## [5.0.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.7...@aws-amplify/storage@5.0.8) (2022-12-27)

**Note:** Version bump only for package @aws-amplify/storage

## [5.0.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.6...@aws-amplify/storage@5.0.7) (2022-12-16)

**Note:** Version bump only for package @aws-amplify/storage

## [5.0.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.5...@aws-amplify/storage@5.0.6) (2022-12-15)

**Note:** Version bump only for package @aws-amplify/storage

## [5.0.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.4...@aws-amplify/storage@5.0.5) (2022-12-06)

**Note:** Version bump only for package @aws-amplify/storage

## [5.0.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.3...@aws-amplify/storage@5.0.4) (2022-11-23)

### Bug Fixes

- Storage interface types ([#10696](https://github.com/aws-amplify/amplify-js/issues/10696)) ([dbc44fb](https://github.com/aws-amplify/amplify-js/commit/dbc44fbcfe2fd83fd1927db8ca49d99a110f3f55))

## [5.0.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.2...@aws-amplify/storage@5.0.3) (2022-11-19)

**Note:** Version bump only for package @aws-amplify/storage

## [5.0.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.1...@aws-amplify/storage@5.0.2) (2022-11-16)

**Note:** Version bump only for package @aws-amplify/storage

## [5.0.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@5.0.0...@aws-amplify/storage@5.0.1) (2022-11-11)

### Bug Fixes

- **storage:** changed returned event.key value when using resumable:true to be consistent with returned keys in storage ([#10651](https://github.com/aws-amplify/amplify-js/issues/10651)) ([623374d](https://github.com/aws-amplify/amplify-js/commit/623374dedb951061e49529c11434d31d36c31bf8))

# [5.0.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.14...@aws-amplify/storage@5.0.0) (2022-11-09)

### Bug Fixes

- **storage:** Storage.list receives nextToken to align with API ([#10626](https://github.com/aws-amplify/amplify-js/issues/10626)) ([b518d62](https://github.com/aws-amplify/amplify-js/commit/b518d6247386b84b8eebe7225bd4ea0292d8301d))
- Consolidating naming to avoid unnecessary extra exports ([8df5428](https://github.com/aws-amplify/amplify-js/commit/8df54281a59547d59dc4eec39b778aec7763544e))
- **storage:** Fix storage api to have correct typing of .list response ([ca23e5e](https://github.com/aws-amplify/amplify-js/commit/ca23e5e4158067a909c26e47c1c415a7fcaf4db3))
- **storage:** Optimized storage category `sideEffects` to improve shake-ability ([#10375](https://github.com/aws-amplify/amplify-js/issues/10375)) ([58014c5](https://github.com/aws-amplify/amplify-js/commit/58014c51722b3af246a19e437d34de171dcff64c))

### Features

- Storage/pagination for storage list api ([#10199](https://github.com/aws-amplify/amplify-js/pull/10199))
- Setup tslib & importHelpers to improve bundle size ([#10435](https://github.com/aws-amplify/amplify-js/pull/10435))
- Remove (most) default exports ([10461](https://github.com/aws-amplify/amplify-js/pull/10461))
- Expand \* exports to optimize tree-shaking ([#10555](https://github.com/aws-amplify/amplify-js/pull/10555))
- add a typescript coverage report mechanism ([#10551](https://github.com/aws-amplify/amplify-js/issues/10551)) ([8e8df55](https://github.com/aws-amplify/amplify-js/commit/8e8df55b449f8bae2fe962fe282613d1b818cc5a)), closes [#10379](https://github.com/aws-amplify/amplify-js/issues/10379)
- **storage:** updating naming for consistency across libraries ([#10414](https://github.com/aws-amplify/amplify-js/issues/10414)) ([85c682a](https://github.com/aws-amplify/amplify-js/commit/85c682acd5d8b615f9d8934e426b0000009f7cda))

## [4.5.13](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.12...@aws-amplify/storage@4.5.13) (2022-10-27)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.12](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.11...@aws-amplify/storage@4.5.12) (2022-10-26)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.10...@aws-amplify/storage@4.5.11) (2022-10-25)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.9...@aws-amplify/storage@4.5.10) (2022-10-14)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.8...@aws-amplify/storage@4.5.9) (2022-10-14)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.6...@aws-amplify/storage@4.5.8) (2022-09-30)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.6...@aws-amplify/storage@4.5.7) (2022-09-20)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.5...@aws-amplify/storage@4.5.6) (2022-09-08)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.4...@aws-amplify/storage@4.5.5) (2022-09-01)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.3...@aws-amplify/storage@4.5.4) (2022-08-23)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.2...@aws-amplify/storage@4.5.3) (2022-08-18)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.1...@aws-amplify/storage@4.5.2) (2022-08-16)

**Note:** Version bump only for package @aws-amplify/storage

## [4.5.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.5.0...@aws-amplify/storage@4.5.1) (2022-08-01)

**Note:** Version bump only for package @aws-amplify/storage

# [4.5.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.29...@aws-amplify/storage@4.5.0) (2022-07-28)

### Features

- **@aws-amplify/storage:** Access all files from S3 with List API ([#10095](https://github.com/aws-amplify/amplify-js/issues/10095)) ([366c32e](https://github.com/aws-amplify/amplify-js/commit/366c32e2d87d73210bbd01ca1da55a5899f5a503))

## [4.4.29](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.28...@aws-amplify/storage@4.4.29) (2022-07-21)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.28](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.27...@aws-amplify/storage@4.4.28) (2022-07-07)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.27](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.26...@aws-amplify/storage@4.4.27) (2022-06-18)

### Bug Fixes

- remove comments ([b5c6825](https://github.com/aws-amplify/amplify-js/commit/b5c6825a28e58986b26cce662f8db7a3623146e7))
- update axios ([67316d7](https://github.com/aws-amplify/amplify-js/commit/67316d78fd829b9d4875a25d00719b175738e594))

## [4.4.26](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.25...@aws-amplify/storage@4.4.26) (2022-06-15)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.25](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.24...@aws-amplify/storage@4.4.25) (2022-05-24)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.24](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.23...@aws-amplify/storage@4.4.24) (2022-05-23)

### Bug Fixes

- **@aws-amplify/storage:** throw error if all upload parts complete but upload cannot be finished ([#9317](https://github.com/aws-amplify/amplify-js/issues/9317)) ([798a8f0](https://github.com/aws-amplify/amplify-js/commit/798a8f075021582cc3e1f4f8ad239562ec4de566))

## [4.4.23](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.22...@aws-amplify/storage@4.4.23) (2022-05-12)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.22](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.21...@aws-amplify/storage@4.4.22) (2022-05-03)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.21](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.20...@aws-amplify/storage@4.4.21) (2022-04-14)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.20](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.19...@aws-amplify/storage@4.4.20) (2022-04-04)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.19](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.18...@aws-amplify/storage@4.4.19) (2022-03-28)

### Bug Fixes

- **storage:** axios handler error handling fix ([#9587](https://github.com/aws-amplify/amplify-js/issues/9587)) ([2ceaa44](https://github.com/aws-amplify/amplify-js/commit/2ceaa44ce88c96e9121b903c0d9798e4a918df4a))

## [4.4.18](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.17...@aws-amplify/storage@4.4.18) (2022-03-22)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.17](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.16...@aws-amplify/storage@4.4.17) (2022-03-10)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.16](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.15...@aws-amplify/storage@4.4.16) (2022-02-28)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.15](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.14...@aws-amplify/storage@4.4.15) (2022-02-03)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.14](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.13...@aws-amplify/storage@4.4.14) (2022-01-27)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.13](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.12...@aws-amplify/storage@4.4.13) (2022-01-07)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.12](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.11...@aws-amplify/storage@4.4.12) (2021-12-16)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.10...@aws-amplify/storage@4.4.11) (2021-12-03)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.9...@aws-amplify/storage@4.4.10) (2021-12-02)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.8...@aws-amplify/storage@4.4.9) (2021-11-18)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.7...@aws-amplify/storage@4.4.8) (2021-11-16)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.6...@aws-amplify/storage@4.4.7) (2021-11-12)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.5...@aws-amplify/storage@4.4.6) (2021-11-09)

### Bug Fixes

- **@aws-amplify/storage:** add useAccelerateEndpoint to create s3client ([#9144](https://github.com/aws-amplify/amplify-js/issues/9144)) ([853adc7](https://github.com/aws-amplify/amplify-js/commit/853adc7554f0a61922e3348d3626c73a5166266d))
- **@aws-amplify/storage:** Automatically adjust systemClockoffset in Storage ([#9115](https://github.com/aws-amplify/amplify-js/issues/9115)) ([873941c](https://github.com/aws-amplify/amplify-js/commit/873941c655d9fe87a75238eadc0ae57dacc2fa16))

## [4.4.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.4...@aws-amplify/storage@4.4.5) (2021-10-28)

### Bug Fixes

- **@aws-amplify/storage:** update axios http handler error handling ([#9125](https://github.com/aws-amplify/amplify-js/issues/9125)) ([55a78d6](https://github.com/aws-amplify/amplify-js/commit/55a78d6471306143eebbd855c246af225e8d90d8))

## [4.4.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.3...@aws-amplify/storage@4.4.4) (2021-10-21)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.2...@aws-amplify/storage@4.4.3) (2021-10-07)

**Note:** Version bump only for package @aws-amplify/storage

## [4.4.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.1...@aws-amplify/storage@4.4.2) (2021-09-30)

### Bug Fixes

- **@aws-amplify/storage:** fix type error in types/Storage.ts ([#8956](https://github.com/aws-amplify/amplify-js/issues/8956)) ([806d266](https://github.com/aws-amplify/amplify-js/commit/806d266ddba00f5ab42f8c6c83c7b8c94aad49aa))

## [4.4.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.4.0...@aws-amplify/storage@4.4.1) (2021-09-24)

**Note:** Version bump only for package @aws-amplify/storage

# [4.4.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.11...@aws-amplify/storage@4.4.0) (2021-09-22)

### Features

- **@aws-amplify/storage:** Storage category public API Typescript improvement ([1c3b281](https://github.com/aws-amplify/amplify-js/commit/1c3b281d564db8745d3085489643bb33ac067177))

## [4.3.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.10...@aws-amplify/storage@4.3.11) (2021-09-17)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.9...@aws-amplify/storage@4.3.10) (2021-09-09)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.8...@aws-amplify/storage@4.3.9) (2021-09-07)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.7...@aws-amplify/storage@4.3.8) (2021-09-04)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.6...@aws-amplify/storage@4.3.7) (2021-09-02)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.5...@aws-amplify/storage@4.3.6) (2021-08-26)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.4...@aws-amplify/storage@4.3.5) (2021-08-19)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.3...@aws-amplify/storage@4.3.4) (2021-08-12)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.2...@aws-amplify/storage@4.3.3) (2021-07-28)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.1...@aws-amplify/storage@4.3.2) (2021-07-22)

**Note:** Version bump only for package @aws-amplify/storage

## [4.3.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.3.0...@aws-amplify/storage@4.3.1) (2021-07-16)

**Note:** Version bump only for package @aws-amplify/storage

# [4.3.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.2.1...@aws-amplify/storage@4.3.0) (2021-07-08)

### Features

- **@aws-amplify/storage:** Adding download progress tracker for Storage.get ([#8295](https://github.com/aws-amplify/amplify-js/issues/8295)) ([8fe1853](https://github.com/aws-amplify/amplify-js/commit/8fe18534b752d807d175104cbd8ccb3099997b2d))

## [4.2.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.2.0...@aws-amplify/storage@4.2.1) (2021-06-24)

**Note:** Version bump only for package @aws-amplify/storage

# [4.2.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.1.1...@aws-amplify/storage@4.2.0) (2021-06-18)

### Features

- **storage:** Adding copy API to Storage ([#8431](https://github.com/aws-amplify/amplify-js/issues/8431)) ([9981403](https://github.com/aws-amplify/amplify-js/commit/99814030d45044701bdce02bf34994304379c84c))

## [4.1.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@4.1.0...@aws-amplify/storage@4.1.1) (2021-06-10)

**Note:** Version bump only for package @aws-amplify/storage

# [4.1.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.4.3...@aws-amplify/storage@4.1.0) (2021-05-26)

### Features

- **Storage:** content encoding optional on put ([#7751](https://github.com/aws-amplify/amplify-js/issues/7751)) ([09c0daa](https://github.com/aws-amplify/amplify-js/commit/09c0daac5bdb08d238c31adb15e936449c4a322d))

## [3.4.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.4.2...@aws-amplify/storage@3.4.3) (2021-05-14)

**Note:** Version bump only for package @aws-amplify/storage

## [3.4.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.4.1...@aws-amplify/storage@3.4.2) (2021-05-11)

**Note:** Version bump only for package @aws-amplify/storage

## [3.4.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.4.0...@aws-amplify/storage@3.4.1) (2021-05-06)

**Note:** Version bump only for package @aws-amplify/storage

# [3.4.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.29...@aws-amplify/storage@3.4.0) (2021-04-15)

### Features

- **@aws-amplify/storage:** Make get and put requests cancellable ([c1ce5ac](https://github.com/aws-amplify/amplify-js/commit/c1ce5ac25cf79cfe649ed5676ef62ef7f283febe))

## [3.3.29](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.28...@aws-amplify/storage@3.3.29) (2021-03-25)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.28](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.27...@aws-amplify/storage@3.3.28) (2021-03-18)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.27](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.26...@aws-amplify/storage@3.3.27) (2021-03-12)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.26](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.25...@aws-amplify/storage@3.3.26) (2021-03-08)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.25](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.24...@aws-amplify/storage@3.3.25) (2021-03-03)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.24](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.23...@aws-amplify/storage@3.3.24) (2021-02-25)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.23](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.22...@aws-amplify/storage@3.3.23) (2021-02-18)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.22](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.21...@aws-amplify/storage@3.3.22) (2021-02-15)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.21](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.20...@aws-amplify/storage@3.3.21) (2021-02-09)

### Reverts

- Revert "chore: bump aws-sdk to 3.4.1 (#7674)" (#7716) ([f142314](https://github.com/aws-amplify/amplify-js/commit/f1423144cf73304f3dc048233b35c831c9a1742d)), closes [#7674](https://github.com/aws-amplify/amplify-js/issues/7674) [#7716](https://github.com/aws-amplify/amplify-js/issues/7716)

## [3.3.20](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.19...@aws-amplify/storage@3.3.20) (2021-02-03)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.19](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.18...@aws-amplify/storage@3.3.19) (2021-02-01)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.18](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.17...@aws-amplify/storage@3.3.18) (2021-01-29)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.17](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.16...@aws-amplify/storage@3.3.17) (2021-01-07)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.16](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.15...@aws-amplify/storage@3.3.16) (2020-12-17)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.15](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.14...@aws-amplify/storage@3.3.15) (2020-12-10)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.14](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.13...@aws-amplify/storage@3.3.14) (2020-11-30)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.13](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.12...@aws-amplify/storage@3.3.13) (2020-11-23)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.12](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.11...@aws-amplify/storage@3.3.12) (2020-11-20)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.10...@aws-amplify/storage@3.3.11) (2020-11-13)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.9...@aws-amplify/storage@3.3.10) (2020-11-03)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.8...@aws-amplify/storage@3.3.9) (2020-10-31)

### Bug Fixes

- **amazon-cognito-identity-js:** update random implementation ([#7090](https://github.com/aws-amplify/amplify-js/issues/7090)) ([7048453](https://github.com/aws-amplify/amplify-js/commit/70484532da8a9953384b00b223b2b3ba0c0e845e))

## [3.3.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.7...@aws-amplify/storage@3.3.8) (2020-10-29)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.6...@aws-amplify/storage@3.3.7) (2020-10-15)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.5...@aws-amplify/storage@3.3.6) (2020-10-01)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.4...@aws-amplify/storage@3.3.5) (2020-09-25)

### Bug Fixes

- Add files with Amplify.register to sideEffects array ([#6867](https://github.com/aws-amplify/amplify-js/issues/6867)) ([58ddbf8](https://github.com/aws-amplify/amplify-js/commit/58ddbf8811e44695d97b6ab8be8f7cd2a2242921))

## [3.3.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.3...@aws-amplify/storage@3.3.4) (2020-09-16)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.2...@aws-amplify/storage@3.3.3) (2020-09-15)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.1...@aws-amplify/storage@3.3.2) (2020-09-10)

**Note:** Version bump only for package @aws-amplify/storage

## [3.3.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.3.0...@aws-amplify/storage@3.3.1) (2020-09-03)

**Note:** Version bump only for package @aws-amplify/storage

# [3.3.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.14...@aws-amplify/storage@3.3.0) (2020-09-03)

### Features

- **SSR:** withSSRContext ([#6146](https://github.com/aws-amplify/amplify-js/issues/6146)) ([1cb1afd](https://github.com/aws-amplify/amplify-js/commit/1cb1afd1e56135908dceb2ef6403f0b3e78067fe))

## [3.2.14](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.13...@aws-amplify/storage@3.2.14) (2020-09-01)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.13](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.12...@aws-amplify/storage@3.2.13) (2020-08-19)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.12](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.11...@aws-amplify/storage@3.2.12) (2020-08-06)

### Bug Fixes

- **@aws-amplify/storage:** fix s3 multipart upload for very large files ([#6509](https://github.com/aws-amplify/amplify-js/issues/6509)) ([621966e](https://github.com/aws-amplify/amplify-js/commit/621966e97c3eb3f9ee356cae201cd62a72db1e08))

## [3.2.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.10...@aws-amplify/storage@3.2.11) (2020-07-27)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.9...@aws-amplify/storage@3.2.10) (2020-07-22)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.8...@aws-amplify/storage@3.2.9) (2020-07-09)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.7...@aws-amplify/storage@3.2.8) (2020-07-07)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.6...@aws-amplify/storage@3.2.7) (2020-06-18)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.5...@aws-amplify/storage@3.2.6) (2020-06-09)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.4...@aws-amplify/storage@3.2.5) (2020-06-04)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.3...@aws-amplify/storage@3.2.4) (2020-06-03)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.2...@aws-amplify/storage@3.2.3) (2020-06-02)

**Note:** Version bump only for package @aws-amplify/storage

## [3.2.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.1...@aws-amplify/storage@3.2.2) (2020-05-26)

### Bug Fixes

- **core:** bump SDK verion to gamma.2 ([#5909](https://github.com/aws-amplify/amplify-js/issues/5909)) ([3bd2d25](https://github.com/aws-amplify/amplify-js/commit/3bd2d2509c2db59cffd7ac81c08ac4f9ef298198))

## [3.2.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.2.0...@aws-amplify/storage@3.2.1) (2020-05-22)

**Note:** Version bump only for package @aws-amplify/storage

# [3.2.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.9...@aws-amplify/storage@3.2.0) (2020-05-14)

### Features

- **@aws-amplify/storage:** AWSS3Provider.ts supports ACL ([#5520](https://github.com/aws-amplify/amplify-js/issues/5520)) ([cc1f981](https://github.com/aws-amplify/amplify-js/commit/cc1f981f65889562949095000f79c58ac7a88388))

## [3.1.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.8...@aws-amplify/storage@3.1.9) (2020-04-30)

### Reverts

- Revert "Upgrade aws-sdk clients to beta4 (#5575)" (#5577) ([f2dcabb](https://github.com/aws-amplify/amplify-js/commit/f2dcabb78110c0bab84780d045d046fabf97b6f4)), closes [#5575](https://github.com/aws-amplify/amplify-js/issues/5575) [#5577](https://github.com/aws-amplify/amplify-js/issues/5577)

## [3.1.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.7...@aws-amplify/storage@3.1.8) (2020-04-24)

**Note:** Version bump only for package @aws-amplify/storage

## [3.1.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.6...@aws-amplify/storage@3.1.7) (2020-04-14)

**Note:** Version bump only for package @aws-amplify/storage

## [3.1.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.5...@aws-amplify/storage@3.1.6) (2020-04-08)

**Note:** Version bump only for package @aws-amplify/storage

## [3.1.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.4...@aws-amplify/storage@3.1.5) (2020-04-07)

**Note:** Version bump only for package @aws-amplify/storage

## [3.1.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.3...@aws-amplify/storage@3.1.4) (2020-04-03)

**Note:** Version bump only for package @aws-amplify/storage

## [3.1.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.2...@aws-amplify/storage@3.1.3) (2020-04-02)

### Bug Fixes

- **@aws-amplify/ui-components:** Fix shadow dom form submit ([#5160](https://github.com/aws-amplify/amplify-js/issues/5160)) ([766c5ac](https://github.com/aws-amplify/amplify-js/commit/766c5ac5bdcf22f772340f78f5d45790f3142b71))

## [3.1.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.1...@aws-amplify/storage@3.1.2) (2020-04-01)

**Note:** Version bump only for package @aws-amplify/storage

## [3.1.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@3.1.0...@aws-amplify/storage@3.1.1) (2020-04-01)

**Note:** Version bump only for package @aws-amplify/storage

# [3.1.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@2.2.3...@aws-amplify/storage@3.1.0) (2020-03-31)

### Bug Fixes

- **@aws-amplify/storage:** expose tree-shaking for Webpack ([28a34a5](https://github.com/aws-amplify/amplify-js/commit/28a34a5fa7d7cc98343a2f630bb3232e16c0c047))

### Features

- **@aws-amplify/storage:** publish ES2015/ESM artifacts ([bc8610a](https://github.com/aws-amplify/amplify-js/commit/bc8610a3eaeb667ef98e492a41485b14c09312cb))
- append amplify user agent to all V3 SDK calls ([#4564](https://github.com/aws-amplify/amplify-js/issues/4564)) ([175d4c3](https://github.com/aws-amplify/amplify-js/commit/175d4c34ccb9cd5674c228db14513827d1c80d3f))
- **@aws-amplify/storage:** S3 upload progress reporting and multipart upload ([#4558](https://github.com/aws-amplify/amplify-js/issues/4558)) ([64b0bec](https://github.com/aws-amplify/amplify-js/commit/64b0bec958c7d31b1b82208e397b3013a98de625)), closes [#4404](https://github.com/aws-amplify/amplify-js/issues/4404) [#4474](https://github.com/aws-amplify/amplify-js/issues/4474)

### Reverts

- Revert "Publish" ([1319d31](https://github.com/aws-amplify/amplify-js/commit/1319d319b69717e76660fbfa6f1a845195c6d635))

## [2.2.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@2.2.2...@aws-amplify/storage@2.2.3) (2020-03-30)

**Note:** Version bump only for package @aws-amplify/storage

## [2.2.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@2.2.1...@aws-amplify/storage@2.2.2) (2020-03-25)

**Note:** Version bump only for package @aws-amplify/storage

## [2.2.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@2.2.0...@aws-amplify/storage@2.2.1) (2020-02-28)

**Note:** Version bump only for package @aws-amplify/storage

# [2.2.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@2.1.3...@aws-amplify/storage@2.2.0) (2020-02-07)

### Bug Fixes

- **cache:** export correct module for RN ([#4786](https://github.com/aws-amplify/amplify-js/issues/4786)) ([a15730c](https://github.com/aws-amplify/amplify-js/commit/a15730cc50692d9d31a0f586c3544b3dcdbea659))

### Features

- **@aws-amplify/storage:** add support to maxKeys when listing objects ([#4099](https://github.com/aws-amplify/amplify-js/issues/4099)) ([030b6c3](https://github.com/aws-amplify/amplify-js/commit/030b6c310367b136e40bbd8ff6e6d6916b2706b3))
- **@aws-amplify/storage:** get supports Response headers ([#4323](https://github.com/aws-amplify/amplify-js/issues/4323)) ([4a4340a](https://github.com/aws-amplify/amplify-js/commit/4a4340a8f9b41d21d4fc8f2b56b2f95a236a2475))

## [2.1.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@2.1.2...@aws-amplify/storage@2.1.3) (2020-01-10)

### Bug Fixes

- [#4311](https://github.com/aws-amplify/amplify-js/issues/4311) Update main entry field to point to CJS builds instead of webpack bundles ([#4678](https://github.com/aws-amplify/amplify-js/issues/4678)) ([54fbdf4](https://github.com/aws-amplify/amplify-js/commit/54fbdf4b1393567735fb7b5f4144db273f1a5f6a))

## [2.1.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@2.1.1...@aws-amplify/storage@2.1.2) (2019-12-18)

**Note:** Version bump only for package @aws-amplify/storage

## [2.1.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@2.1.0...@aws-amplify/storage@2.1.1) (2019-12-03)

**Note:** Version bump only for package @aws-amplify/storage

# [2.1.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@1.2.4...@aws-amplify/storage@2.1.0) (2019-11-15)

### Features

- enable watch mode for builds ([#4358](https://github.com/aws-amplify/amplify-js/issues/4358)) ([055e530](https://github.com/aws-amplify/amplify-js/commit/055e5308efc308ae6beee78f8963bb2f812e1f85))

# [1.3.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@1.2.4...@aws-amplify/storage@1.3.0) (2020-01-10)

### Bug Fixes

- **@aws-amplify/storage:** expose tree-shaking for Webpack ([28a34a5](https://github.com/aws-amplify/amplify-js/commit/28a34a5fa7d7cc98343a2f630bb3232e16c0c047))

### Features

- **@aws-amplify/storage:** publish ES2015/ESM artifacts ([bc8610a](https://github.com/aws-amplify/amplify-js/commit/bc8610a3eaeb667ef98e492a41485b14c09312cb))
- append amplify user agent to all V3 SDK calls ([#4564](https://github.com/aws-amplify/amplify-js/issues/4564)) ([175d4c3](https://github.com/aws-amplify/amplify-js/commit/175d4c34ccb9cd5674c228db14513827d1c80d3f))
- enable watch mode for builds ([#4358](https://github.com/aws-amplify/amplify-js/issues/4358)) ([055e530](https://github.com/aws-amplify/amplify-js/commit/055e5308efc308ae6beee78f8963bb2f812e1f85))

### Reverts

- Revert "Publish" ([1319d31](https://github.com/aws-amplify/amplify-js/commit/1319d319b69717e76660fbfa6f1a845195c6d635))

## [1.2.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@1.2.3...@aws-amplify/storage@1.2.4) (2019-10-29)

**Note:** Version bump only for package @aws-amplify/storage

## [1.2.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/storage@1.2.2...@aws-amplify/storage@1.2.3) (2019-10-23)

**Note:** Version bump only for package @aws-amplify/storage

## [1.2.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.2.0...@aws-amplify/storage@1.2.2) (2019-10-10)

**Note:** Version bump only for package @aws-amplify/storage

# [1.2.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.1.2...@aws-amplify/storage@1.2.0) (2019-10-10)

### Features

- Added Prettier formatting ([4dfd9aa](https://github.com/aws/aws-amplify/commit/4dfd9aa9ab900307c9d17c68448a6ca4aa08fd5a))

## [1.1.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.1.1...@aws-amplify/storage@1.1.2) (2019-09-05)

**Note:** Version bump only for package @aws-amplify/storage

## [1.1.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.1.0...@aws-amplify/storage@1.1.1) (2019-09-04)

### Bug Fixes

- **@aws-amplify/storage:** fix typo ([#3828](https://github.com/aws/aws-amplify/issues/3828)) ([b93af35](https://github.com/aws/aws-amplify/commit/b93af35))

# [1.1.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.36...@aws-amplify/storage@1.1.0) (2019-08-05)

### Features

- Add support for local testing of api and storage ([#3806](https://github.com/aws/aws-amplify/issues/3806)) ([4390e8e](https://github.com/aws/aws-amplify/commit/4390e8e))

## [1.0.36](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.35...@aws-amplify/storage@1.0.36) (2019-08-01)

### Bug Fixes

- **@aws-amplify/storage:** removed not using variables ([#3768](https://github.com/aws/aws-amplify/issues/3768)) ([4164cf5](https://github.com/aws/aws-amplify/commit/4164cf5))

## [1.0.35](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.34...@aws-amplify/storage@1.0.35) (2019-07-31)

**Note:** Version bump only for package @aws-amplify/storage

## [1.0.34](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.33...@aws-amplify/storage@1.0.34) (2019-07-30)

**Note:** Version bump only for package @aws-amplify/storage

## [1.0.33](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.31...@aws-amplify/storage@1.0.33) (2019-07-18)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.32-unstable.1"></a>

## [1.0.32-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.31...@aws-amplify/storage@1.0.32-unstable.1) (2019-07-12)

### Bug Fixes

- allow SSE to be passed in global configure of storage ([9ee76cc](https://github.com/aws/aws-amplify/commit/9ee76cc))
- allow SSE to be passed in global configure of storage ([8fb26c4](https://github.com/aws/aws-amplify/commit/8fb26c4))

<a name="1.0.31"></a>

## [1.0.31](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.31-unstable.2...@aws-amplify/storage@1.0.31) (2019-06-17)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.31-unstable.2"></a>

## [1.0.31-unstable.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.31-unstable.1...@aws-amplify/storage@1.0.31-unstable.2) (2019-06-14)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.31-unstable.1"></a>

## [1.0.31-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.30...@aws-amplify/storage@1.0.31-unstable.1) (2019-05-24)

### Bug Fixes

- **aws-amplify:** manual version bumps for lerna issue ([9ce5a72](https://github.com/aws/aws-amplify/commit/9ce5a72))

<a name="1.0.30"></a>

## [1.0.30](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.30-unstable.1...@aws-amplify/storage@1.0.30) (2019-05-14)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.30-unstable.1"></a>

## [1.0.30-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.30-unstable.0...@aws-amplify/storage@1.0.30-unstable.1) (2019-05-13)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.30-unstable.0"></a>

## [1.0.30-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.29...@aws-amplify/storage@1.0.30-unstable.0) (2019-05-10)

### Bug Fixes

- **@aws-amplify/storage:** The issue was when configuring Amplify or Storage more than once, e.g. `Amplify.configure(...)` or `Storage.configure(...)` the default level was set to `private`. The default level will always be `public` except when you configure it to something different like `Storage.configure({ level: 'protected' })` ([#3222](https://github.com/aws/aws-amplify/issues/3222)) ([8b46eb8](https://github.com/aws/aws-amplify/commit/8b46eb8))

<a name="1.0.29"></a>

## [1.0.29](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.29-unstable.3...@aws-amplify/storage@1.0.29) (2019-05-06)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.29-unstable.3"></a>

## [1.0.29-unstable.3](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.29-unstable.2...@aws-amplify/storage@1.0.29-unstable.3) (2019-05-06)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.29-unstable.2"></a>

## [1.0.29-unstable.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.29-unstable.1...@aws-amplify/storage@1.0.29-unstable.2) (2019-04-17)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.29-unstable.1"></a>

## [1.0.29-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.29-unstable.0...@aws-amplify/storage@1.0.29-unstable.1) (2019-04-15)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.29-unstable.0"></a>

## [1.0.29-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.28...@aws-amplify/storage@1.0.29-unstable.0) (2019-04-12)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.28"></a>

## [1.0.28](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.28-unstable.1...@aws-amplify/storage@1.0.28) (2019-04-04)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.28-unstable.1"></a>

## [1.0.28-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.28-unstable.0...@aws-amplify/storage@1.0.28-unstable.1) (2019-04-04)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.28-unstable.0"></a>

## [1.0.28-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.27...@aws-amplify/storage@1.0.28-unstable.0) (2019-04-02)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.27"></a>

## [1.0.27](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.27-unstable.2...@aws-amplify/storage@1.0.27) (2019-03-28)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.27-unstable.2"></a>

## [1.0.27-unstable.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.27-unstable.1...@aws-amplify/storage@1.0.27-unstable.2) (2019-03-28)

### Features

- **core:** Hub refactor and tests ([7ac5bcf](https://github.com/aws/aws-amplify/commit/7ac5bcf))

<a name="1.0.27-unstable.1"></a>

## [1.0.27-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.27-unstable.0...@aws-amplify/storage@1.0.27-unstable.1) (2019-03-22)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.27-unstable.0"></a>

## [1.0.27-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.26...@aws-amplify/storage@1.0.27-unstable.0) (2019-03-21)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.26"></a>

## [1.0.26](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.26-unstable.4...@aws-amplify/storage@1.0.26) (2019-03-04)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.26-unstable.4"></a>

## [1.0.26-unstable.4](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.26-unstable.3...@aws-amplify/storage@1.0.26-unstable.4) (2019-03-04)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.26-unstable.3"></a>

## [1.0.26-unstable.3](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.26-unstable.2...@aws-amplify/storage@1.0.26-unstable.3) (2019-02-28)

### Features

- **storage:** Added tagging support on put request (S3) ([#2606](https://github.com/aws/aws-amplify/issues/2606)) ([50243b7](https://github.com/aws/aws-amplify/commit/50243b7)), closes [#2594](https://github.com/aws/aws-amplify/issues/2594)

<a name="1.0.26-unstable.2"></a>

## [1.0.26-unstable.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.26-unstable.1...@aws-amplify/storage@1.0.26-unstable.2) (2019-02-27)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.26-unstable.1"></a>

## [1.0.26-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.26-unstable.0...@aws-amplify/storage@1.0.26-unstable.1) (2019-02-27)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.26-unstable.0"></a>

## [1.0.26-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.25...@aws-amplify/storage@1.0.26-unstable.0) (2019-01-10)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.25"></a>

## [1.0.25](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.25-unstable.0...@aws-amplify/storage@1.0.25) (2019-01-10)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.25-unstable.0"></a>

## [1.0.25-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.24...@aws-amplify/storage@1.0.25-unstable.0) (2018-12-26)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.24"></a>

## [1.0.24](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.24-unstable.1...@aws-amplify/storage@1.0.24) (2018-12-26)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.24-unstable.1"></a>

## [1.0.24-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.24-unstable.0...@aws-amplify/storage@1.0.24-unstable.1) (2018-12-22)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.24-unstable.0"></a>

## [1.0.24-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.23...@aws-amplify/storage@1.0.24-unstable.0) (2018-12-19)

### Bug Fixes

- **@aws-amplify/storage:** Explicitly declare signatureVersion 'v4' ([#2379](https://github.com/aws/aws-amplify/issues/2379)) ([32d439a](https://github.com/aws/aws-amplify/commit/32d439a))

<a name="1.0.23"></a>

## [1.0.23](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.23-unstable.2...@aws-amplify/storage@1.0.23) (2018-12-13)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.23-unstable.2"></a>

## [1.0.23-unstable.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.23-unstable.1...@aws-amplify/storage@1.0.23-unstable.2) (2018-12-13)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.23-unstable.1"></a>

## [1.0.23-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.23-unstable.0...@aws-amplify/storage@1.0.23-unstable.1) (2018-12-07)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.23-unstable.0"></a>

## [1.0.23-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.22...@aws-amplify/storage@1.0.23-unstable.0) (2018-12-07)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.22"></a>

## [1.0.22](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.21...@aws-amplify/storage@1.0.22) (2018-12-07)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.22-unstable.0"></a>

## [1.0.22-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.21...@aws-amplify/storage@1.0.22-unstable.0) (2018-12-06)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.21"></a>

## [1.0.21](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.20...@aws-amplify/storage@1.0.21) (2018-12-06)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.21-unstable.0"></a>

## [1.0.21-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.20...@aws-amplify/storage@1.0.21-unstable.0) (2018-12-05)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.20"></a>

## [1.0.20](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.20-unstable.5...@aws-amplify/storage@1.0.20) (2018-12-03)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.20-unstable.5"></a>

## [1.0.20-unstable.5](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.20-unstable.4...@aws-amplify/storage@1.0.20-unstable.5) (2018-11-29)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.20-unstable.4"></a>

## [1.0.20-unstable.4](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.20-unstable.3...@aws-amplify/storage@1.0.20-unstable.4) (2018-11-27)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.20-unstable.3"></a>

## [1.0.20-unstable.3](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.20-unstable.2...@aws-amplify/storage@1.0.20-unstable.3) (2018-11-26)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.20-unstable.2"></a>

## [1.0.20-unstable.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.20-unstable.1...@aws-amplify/storage@1.0.20-unstable.2) (2018-11-20)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.20-unstable.1"></a>

## [1.0.20-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.20-unstable.0...@aws-amplify/storage@1.0.20-unstable.1) (2018-11-19)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.20-unstable.0"></a>

## [1.0.20-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.19...@aws-amplify/storage@1.0.20-unstable.0) (2018-11-15)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.19"></a>

## [1.0.19](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.19-unstable.0...@aws-amplify/storage@1.0.19) (2018-11-12)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.19-unstable.0"></a>

## [1.0.19-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.18...@aws-amplify/storage@1.0.19-unstable.0) (2018-11-06)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.18"></a>

## [1.0.18](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.18-unstable.0...@aws-amplify/storage@1.0.18) (2018-11-01)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.18-unstable.0"></a>

## [1.0.18-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.17...@aws-amplify/storage@1.0.18-unstable.0) (2018-10-30)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.17"></a>

## [1.0.17](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.17-unstable.1...@aws-amplify/storage@1.0.17) (2018-10-29)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.17-unstable.1"></a>

## [1.0.17-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.17-unstable.0...@aws-amplify/storage@1.0.17-unstable.1) (2018-10-18)

### Bug Fixes

- **storage:** Update JSDoc to clarify that Storage.get can return a Promise<String|Object> ([#1913](https://github.com/aws/aws-amplify/issues/1913)) ([dfc3bb7](https://github.com/aws/aws-amplify/commit/dfc3bb7)), closes [#1912](https://github.com/aws/aws-amplify/issues/1912)

<a name="1.0.17-unstable.0"></a>

## [1.0.17-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.16...@aws-amplify/storage@1.0.17-unstable.0) (2018-10-18)

### Features

- **@aws-amplify/storage:** Added ability to track progress of S3 uploads ([#1830](https://github.com/aws/aws-amplify/issues/1830)) ([5aef207](https://github.com/aws/aws-amplify/commit/5aef207))

<a name="1.0.16"></a>

## [1.0.16](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.16-unstable.4...@aws-amplify/storage@1.0.16) (2018-10-17)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.16-unstable.4"></a>

## [1.0.16-unstable.4](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.16-unstable.3...@aws-amplify/storage@1.0.16-unstable.4) (2018-10-17)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.16-unstable.3"></a>

## [1.0.16-unstable.3](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.16-unstable.2...@aws-amplify/storage@1.0.16-unstable.3) (2018-10-16)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.16-unstable.2"></a>

## [1.0.16-unstable.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.16-unstable.1...@aws-amplify/storage@1.0.16-unstable.2) (2018-10-08)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.16-unstable.1"></a>

## [1.0.16-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.16-unstable.0...@aws-amplify/storage@1.0.16-unstable.1) (2018-10-05)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.16-unstable.0"></a>

## [1.0.16-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.15-unstable.1...@aws-amplify/storage@1.0.16-unstable.0) (2018-10-05)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.15"></a>

## [1.0.15](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.15-unstable.1...@aws-amplify/storage@1.0.15) (2018-10-04)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.15-unstable.1"></a>

## [1.0.15-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.15-unstable.0...@aws-amplify/storage@1.0.15-unstable.1) (2018-10-03)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.15-unstable.0"></a>

## [1.0.15-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.14-unstable.1...@aws-amplify/storage@1.0.15-unstable.0) (2018-10-03)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.14"></a>

## [1.0.14](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.14-unstable.1...@aws-amplify/storage@1.0.14) (2018-10-03)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.14-unstable.1"></a>

## [1.0.14-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.14-unstable.0...@aws-amplify/storage@1.0.14-unstable.1) (2018-10-01)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.14-unstable.0"></a>

## [1.0.14-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.13...@aws-amplify/storage@1.0.14-unstable.0) (2018-09-28)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.13"></a>

## [1.0.13](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.13-unstable.1...@aws-amplify/storage@1.0.13) (2018-09-27)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.13-unstable.1"></a>

## [1.0.13-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.13-unstable.0...@aws-amplify/storage@1.0.13-unstable.1) (2018-09-25)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.13-unstable.0"></a>

## [1.0.13-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.12...@aws-amplify/storage@1.0.13-unstable.0) (2018-09-22)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.12"></a>

## [1.0.12](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.12-unstable.0...@aws-amplify/storage@1.0.12) (2018-09-21)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.12-unstable.0"></a>

## [1.0.12-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.10...@aws-amplify/storage@1.0.12-unstable.0) (2018-09-21)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.11"></a>

## [1.0.11](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.10...@aws-amplify/storage@1.0.11) (2018-09-21)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.10"></a>

## [1.0.10](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.9...@aws-amplify/storage@1.0.10) (2018-09-17)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.9"></a>

## [1.0.9](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.8...@aws-amplify/storage@1.0.9) (2018-09-12)

### Bug Fixes

- **aws-amplify:** update the version of aws-sdk to latest ([482402d](https://github.com/aws/aws-amplify/commit/482402d))

<a name="1.0.8"></a>

## [1.0.8](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.7...@aws-amplify/storage@1.0.8) (2018-09-09)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.8-unstable.1"></a>

## [1.0.8-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.7...@aws-amplify/storage@1.0.8-unstable.1) (2018-08-30)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.7"></a>

## [1.0.7](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.6-unstable.1...@aws-amplify/storage@1.0.7) (2018-08-28)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.6-unstable.1"></a>

## [1.0.6-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.6-unstable.0...@aws-amplify/storage@1.0.6-unstable.1) (2018-08-20)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.6-unstable.0"></a>

## [1.0.6-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.5...@aws-amplify/storage@1.0.6-unstable.0) (2018-08-19)

### Bug Fixes

- **aws-amplify-angular:** Angular rollup ([#1441](https://github.com/aws/aws-amplify/issues/1441)) ([eb84e01](https://github.com/aws/aws-amplify/commit/eb84e01))

<a name="1.0.5"></a>

## [1.0.5](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.5-unstable.0...@aws-amplify/storage@1.0.5) (2018-08-14)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.5-unstable.0"></a>

## [1.0.5-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.4...@aws-amplify/storage@1.0.5-unstable.0) (2018-08-09)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.4"></a>

## [1.0.4](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.3-unstable.1...@aws-amplify/storage@1.0.4) (2018-08-06)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.3-unstable.1"></a>

## [1.0.3-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.3...@aws-amplify/storage@1.0.3-unstable.1) (2018-08-06)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.3"></a>

## [1.0.3](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.3-unstable.0...@aws-amplify/storage@1.0.3) (2018-07-28)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.3-unstable.0"></a>

## [1.0.3-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.2...@aws-amplify/storage@1.0.3-unstable.0) (2018-07-26)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.2"></a>

## [1.0.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.2-unstable.0...@aws-amplify/storage@1.0.2) (2018-07-19)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.2-unstable.0"></a>

## [1.0.2-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.1...@aws-amplify/storage@1.0.2-unstable.0) (2018-07-19)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.1"></a>

## [1.0.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.1-unstable.2...@aws-amplify/storage@1.0.1) (2018-07-18)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.1-unstable.2"></a>

## [1.0.1-unstable.2](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.1-unstable.1...@aws-amplify/storage@1.0.1-unstable.2) (2018-07-18)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.1-unstable.1"></a>

## [1.0.1-unstable.1](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.1...@aws-amplify/storage@1.0.1-unstable.1) (2018-07-18)

**Note:** Version bump only for package @aws-amplify/storage

<a name="1.0.1-unstable.0"></a>

## [1.0.1-unstable.0](https://github.com/aws/aws-amplify/compare/@aws-amplify/storage@1.0.1...@aws-amplify/storage@1.0.1-unstable.0) (2018-07-18)

**Note:** Version bump only for package @aws-amplify/storage

<a name="0.1.1-unstable.0"></a>

## 0.1.1-unstable.0 (2018-06-27)

**Note:** Version bump only for package @aws-amplify/storage
