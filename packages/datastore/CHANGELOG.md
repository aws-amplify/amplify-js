# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@4.0.4...@aws-amplify/datastore@4.0.5) (2022-12-06)


### Bug Fixes

* **@aws-amplify/datastore-storage-adapter:** SQLiteAdapter fails on required related models ([#10720](https://github.com/aws-amplify/amplify-js/issues/10720)) ([fa7d6c6](https://github.com/aws-amplify/amplify-js/commit/fa7d6c681496dd45d40a2af672f953e0ff372940))





## [4.0.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@4.0.3...@aws-amplify/datastore@4.0.4) (2022-11-23)

**Note:** Version bump only for package @aws-amplify/datastore





## [4.0.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@4.0.2...@aws-amplify/datastore@4.0.3) (2022-11-19)


### Bug Fixes

* **datastore:** optional hasOne ([#10688](https://github.com/aws-amplify/amplify-js/issues/10688)) ([a851713](https://github.com/aws-amplify/amplify-js/commit/a85171384db4bca202bb5cb5f832a8e319ec89d4))





## [4.0.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@4.0.1...@aws-amplify/datastore@4.0.2) (2022-11-16)


### Bug Fixes

* predicate logic against bools ([#10679](https://github.com/aws-amplify/amplify-js/issues/10679)) ([062cb55](https://github.com/aws-amplify/amplify-js/commit/062cb5530ba6d22b8dd97bbd046b08691f874765))





## [4.0.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@4.0.0...@aws-amplify/datastore@4.0.1) (2022-11-11)


### Bug Fixes

* **datastore:** upgrade after destructive schema change ([#10658](https://github.com/aws-amplify/amplify-js/issues/10658)) ([d987a28](https://github.com/aws-amplify/amplify-js/commit/d987a2837d16c2ca93205089eebb837f1f8e7c15))
* export DataStore predicate types ([#10653](https://github.com/aws-amplify/amplify-js/issues/10653)) ([a517610](https://github.com/aws-amplify/amplify-js/commit/a517610889ab4115c40dcd58213414e6e1aabf7b))





# [4.0.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.14.4...@aws-amplify/datastore@4.0.0) (2022-11-09)

### Bug Fixes

- **@aws-amplify/datastore:** remove predicate, AsyncCollection internals from public interfaces ([#10594](https://github.com/aws-amplify/amplify-js/issues/10594)) ([5a05c44](https://github.com/aws-amplify/amplify-js/commit/5a05c4467df4a479f0d2a9d06b78c818d2f40d06))
- Standardize `cache` named export to preserve interoperability with RN ([#10546](https://github.com/aws-amplify/amplify-js/issues/10546)) ([20b096b](https://github.com/aws-amplify/amplify-js/commit/20b096b1a34e6a102d08dabcedb38772f3a6caf7))

### Features

- **@aws-amplify/datastore:** lazy loading and nested/related-model predicates ([#10477](https://github.com/aws-amplify/amplify-js/pull/10477))
- Remove (most) default exports ([10461](https://github.com/aws-amplify/amplify-js/pull/10461))
- Setup tslib & importHelpers to improve bundle size ([#10435](https://github.com/aws-amplify/amplify-js/pull/10435))
- Remove miscellaneous deprecated exports & prototypes ([#10528](https://github.com/aws-amplify/amplify-js/pull/10528))
- add a typescript coverage report mechanism ([#10551](https://github.com/aws-amplify/amplify-js/issues/10551)) ([8e8df55](https://github.com/aws-amplify/amplify-js/commit/8e8df55b449f8bae2fe962fe282613d1b818cc5a)), closes [#10379](https://github.com/aws-amplify/amplify-js/issues/10379)
- change unsupported codegen error message ([#10563](https://github.com/aws-amplify/amplify-js/issues/10563)) ([fa6e515](https://github.com/aws-amplify/amplify-js/commit/fa6e51503e63726539eda9cb396123eb3c5dee93))

## [3.14.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.14.2...@aws-amplify/datastore@3.14.3) (2022-10-27)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.14.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.14.1...@aws-amplify/datastore@3.14.2) (2022-10-26)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.14.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.14.0...@aws-amplify/datastore@3.14.1) (2022-10-25)

### Bug Fixes

- **@aws-amplify/datastore:** introduce "settlement" guarantees to stop() and clear() ([#10450](https://github.com/aws-amplify/amplify-js/issues/10450)) ([16c535b](https://github.com/aws-amplify/amplify-js/commit/16c535beda9386a027c2805f29a359fbeb8bac15)), closes [#10449](https://github.com/aws-amplify/amplify-js/issues/10449)
- **datastore:** CPK on Safari ([#10527](https://github.com/aws-amplify/amplify-js/issues/10527)) ([7a2f3ec](https://github.com/aws-amplify/amplify-js/commit/7a2f3ecf0fda83f087b1c2ce650f4b5f00214dbe))

# [3.14.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.13.0...@aws-amplify/datastore@3.14.0) (2022-10-14)

### Bug Fixes

- **datastore:** unblock vite build after CPK changes ([#10478](https://github.com/aws-amplify/amplify-js/issues/10478)) ([42ae8de](https://github.com/aws-amplify/amplify-js/commit/42ae8de62f53e7d81363c0dd676967454271259a))

### Features

- **datastore:** allow sync query to complete when non-applicable data present ([#10471](https://github.com/aws-amplify/amplify-js/issues/10471)) ([f8e8ff4](https://github.com/aws-amplify/amplify-js/commit/f8e8ff4c1a59d600b96944e5963dfa56a44af035))

# [3.13.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.12...@aws-amplify/datastore@3.13.0) (2022-10-14)

### Bug Fixes

- validate non models when using object literal ([#10417](https://github.com/aws-amplify/amplify-js/issues/10417)) ([b6f6c81](https://github.com/aws-amplify/amplify-js/commit/b6f6c813f80f951f21f986411928c0ddbd1c6b6c))
- **@aws-amplify/datastore:** introduce "settlement" guarantees to stop() and clear() ([#10055](https://github.com/aws-amplify/amplify-js/issues/10055)) ([c64d7d6](https://github.com/aws-amplify/amplify-js/commit/c64d7d6284bc7b41a5a65b4b47d35ea274aed6b3))

### Features

- **datastore:** custom pk support ([66bfe31](https://github.com/aws-amplify/amplify-js/commit/66bfe312f300fd6ca1bc756ab01690d36f337af9))

### Reverts

- "fix(@aws-amplify/datastore): introduce "settlement" guarantees to stop() and clear()" ([#10449](https://github.com/aws-amplify/amplify-js/issues/10449)) ([d726bcc](https://github.com/aws-amplify/amplify-js/commit/d726bccca9712b8f43bc273052f970f8f931dd8c)), closes [aws-amplify/amplify-js#10055](https://github.com/aws-amplify/amplify-js/issues/10055)

## [3.12.12](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.10...@aws-amplify/datastore@3.12.12) (2022-09-30)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.12.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.10...@aws-amplify/datastore@3.12.11) (2022-09-20)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.12.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.9...@aws-amplify/datastore@3.12.10) (2022-09-08)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.12.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.8...@aws-amplify/datastore@3.12.9) (2022-09-01)

### Bug Fixes

- **datastore:** clear before start with nextjs ([#10234](https://github.com/aws-amplify/amplify-js/issues/10234)) ([98dd9f2](https://github.com/aws-amplify/amplify-js/commit/98dd9f27fe798d4337201d082e9f65d785366f8b))

## [3.12.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.7...@aws-amplify/datastore@3.12.8) (2022-08-23)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.12.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.6...@aws-amplify/datastore@3.12.7) (2022-08-18)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.12.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.5...@aws-amplify/datastore@3.12.6) (2022-08-16)

### Bug Fixes

- **datastore:** make di context fields private ([#10162](https://github.com/aws-amplify/amplify-js/issues/10162)) ([88a9ec9](https://github.com/aws-amplify/amplify-js/commit/88a9ec97fca2eb19c9cc9496b8b7d25b75f02073))

## [3.12.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.4...@aws-amplify/datastore@3.12.5) (2022-08-01)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.12.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.3...@aws-amplify/datastore@3.12.4) (2022-07-28)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.12.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.2...@aws-amplify/datastore@3.12.3) (2022-07-21)

### Bug Fixes

- preserve ssr context when using DataStore ([#10088](https://github.com/aws-amplify/amplify-js/issues/10088)) ([a10d920](https://github.com/aws-amplify/amplify-js/commit/a10d920f7fb6199539fb8d9cec2cb4426dbfd47b))

## [3.12.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.1...@aws-amplify/datastore@3.12.2) (2022-07-07)

### Bug Fixes

- decrease error handler verbosity on self recovering errors ([#10030](https://github.com/aws-amplify/amplify-js/issues/10030)) ([fb1f02c](https://github.com/aws-amplify/amplify-js/commit/fb1f02cfa914b81fe0411e8f4d654c69aed22385))

## [3.12.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.12.0...@aws-amplify/datastore@3.12.1) (2022-06-18)

### Bug Fixes

- decrease error handler verbosity on self recovering errors ([#9987](https://github.com/aws-amplify/amplify-js/issues/9987)) ([67ccf09](https://github.com/aws-amplify/amplify-js/commit/67ccf09a93221a06d4560300cfd67fdd9efeda71))

### Reverts

- Revert "fix: decrease error handler verbosity on self recovering errors (#9987)" (#10004) ([eb73ad7](https://github.com/aws-amplify/amplify-js/commit/eb73ad70b3eee0632eaed4bae00f1d2179ae45b5)), closes [#9987](https://github.com/aws-amplify/amplify-js/issues/9987) [#10004](https://github.com/aws-amplify/amplify-js/issues/10004)

# [3.12.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.11.3...@aws-amplify/datastore@3.12.0) (2022-06-15)

### Bug Fixes

- **@aws-amplify/datastore:** adds missing fields to items sent through observe/observeQuery ([#9973](https://github.com/aws-amplify/amplify-js/issues/9973)) ([ca2a11b](https://github.com/aws-amplify/amplify-js/commit/ca2a11b5bc987e71ce3344058a4886bf067cb17b))
- merge patches for consecutive copyOf ([#9936](https://github.com/aws-amplify/amplify-js/issues/9936)) ([d5dd9cb](https://github.com/aws-amplify/amplify-js/commit/d5dd9cb5bf46131fb046cfe55e4899444f9d789e))
- **@aws-amplify/datastore:** fixes observeQuery not removing newly-filtered items from snapshot ([#9879](https://github.com/aws-amplify/amplify-js/issues/9879)) ([d1356b1](https://github.com/aws-amplify/amplify-js/commit/d1356b1e498eb71a4902892afbb41f6ff88abb6f))

### Features

- **datastore:** add error maps for error handler ([#9918](https://github.com/aws-amplify/amplify-js/issues/9918)) ([3a27096](https://github.com/aws-amplify/amplify-js/commit/3a270969b6e097eeed73368091ace191cbc05511))

## [3.11.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.11.2...@aws-amplify/datastore@3.11.3) (2022-05-24)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.11.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.11.1...@aws-amplify/datastore@3.11.2) (2022-05-23)

### Bug Fixes

- **@aws-amplify/datastore-storage-adapter:** remove extra, invalid sqlite mutations again ([#9921](https://github.com/aws-amplify/amplify-js/issues/9921)) ([00923cf](https://github.com/aws-amplify/amplify-js/commit/00923cfaeafcee97a0f54cc6aa04724f7155e75d))

## [3.11.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.11.0...@aws-amplify/datastore@3.11.1) (2022-05-12)

### Bug Fixes

- add error for when schema is not initialized ([#9874](https://github.com/aws-amplify/amplify-js/issues/9874)) ([a63f0ee](https://github.com/aws-amplify/amplify-js/commit/a63f0eec70b96dba2d220f3eeb0c799af8622b5c))

# [3.11.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.10.0...@aws-amplify/datastore@3.11.0) (2022-05-03)

### Bug Fixes

- add newly created models to IDB during migration ([#9754](https://github.com/aws-amplify/amplify-js/issues/9754)) ([58d7e00](https://github.com/aws-amplify/amplify-js/commit/58d7e003463e1cabe3a4bb5601a2cdf11736150d))
- **@aws-amplify/datastore-storage-adapter:** SQLite adapter NULL handling and mutation queue management bugs ([#9813](https://github.com/aws-amplify/amplify-js/issues/9813)) ([fe691fd](https://github.com/aws-amplify/amplify-js/commit/fe691fd4f67adc6ac973dd12ca056563d0720d69))

### Features

- clear DataStore without first starting ([#9768](https://github.com/aws-amplify/amplify-js/issues/9768)) ([38bdabd](https://github.com/aws-amplify/amplify-js/commit/38bdabd5408e03595a90d673bbffd963cf432daa))
- rework error handler ([#9861](https://github.com/aws-amplify/amplify-js/issues/9861)) ([6ae8d10](https://github.com/aws-amplify/amplify-js/commit/6ae8d10569abf24559436a46e1723825e6472489))

# [3.10.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.9.0...@aws-amplify/datastore@3.10.0) (2022-04-14)

### Features

- **data:** Datastore Docs ([#9753](https://github.com/aws-amplify/amplify-js/issues/9753)) ([4eb824f](https://github.com/aws-amplify/amplify-js/commit/4eb824f168df408469557e6ccc60edfee99953c2))

# [3.9.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.8.0...@aws-amplify/datastore@3.9.0) (2022-04-04)

### Features

- update DataStore observe / observeQuery to return all fields in local update snapshot ([#9556](https://github.com/aws-amplify/amplify-js/issues/9556)) ([40ee89b](https://github.com/aws-amplify/amplify-js/commit/40ee89b828e859bfaadea2269cce96562ab6c90a))

# [3.8.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.9...@aws-amplify/datastore@3.8.0) (2022-03-28)

### Features

- PubSub Add Options objects for all Providers and fix: Spelling error and deprecation of old exports ([#9683](https://github.com/aws-amplify/amplify-js/issues/9683)) ([b535af2](https://github.com/aws-amplify/amplify-js/commit/b535af2133b5460c6e8e2fcfd89e1fe235872c27))

## [3.7.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.8...@aws-amplify/datastore@3.7.9) (2022-03-22)

### Bug Fixes

- **@aws-amplify/datastore:** fix mutations to retry indefinitely on network error ([#9724](https://github.com/aws-amplify/amplify-js/issues/9724)) ([5371380](https://github.com/aws-amplify/amplify-js/commit/53713804b79df9c69ac29b75ffc576b4c2002507))

## [3.7.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.7...@aws-amplify/datastore@3.7.8) (2022-03-10)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.7.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.6...@aws-amplify/datastore@3.7.7) (2022-02-28)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.7.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.5...@aws-amplify/datastore@3.7.6) (2022-02-03)

### Bug Fixes

- **datastore:** correctly apply config values ([#9542](https://github.com/aws-amplify/amplify-js/issues/9542)) ([3f8b838](https://github.com/aws-amplify/amplify-js/commit/3f8b83869becf5f9963d61e6f7cfe695badb3b53))

## [3.7.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.4...@aws-amplify/datastore@3.7.5) (2022-01-27)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.7.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.3...@aws-amplify/datastore@3.7.4) (2022-01-07)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.7.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.2...@aws-amplify/datastore@3.7.3) (2021-12-16)

### Bug Fixes

- **@aws-amplify/datastore:** fixes observeQuery in local-only mode ([#9300](https://github.com/aws-amplify/amplify-js/issues/9300)) ([b0b57fb](https://github.com/aws-amplify/amplify-js/commit/b0b57fb1ba81d8ad190c4e67efb878ef4c6a2344))

## [3.7.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.1...@aws-amplify/datastore@3.7.2) (2021-12-03)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.7.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.7.0...@aws-amplify/datastore@3.7.1) (2021-12-02)

### Bug Fixes

- **@aws-amplify/datastore:** belongsTo bug ([#9268](https://github.com/aws-amplify/amplify-js/issues/9268)) ([5106639](https://github.com/aws-amplify/amplify-js/commit/510663981a32443b79dd065ca075b664ca8bdff6))
- **@aws-amplify/datastore:** consecutive saves with timestamps ([#9298](https://github.com/aws-amplify/amplify-js/issues/9298)) ([807dea0](https://github.com/aws-amplify/amplify-js/commit/807dea0acae8389854560ca73b035ecbf220d040))

# [3.7.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.6.1...@aws-amplify/datastore@3.7.0) (2021-11-18)

### Features

- **@aws-amplify/datastore:** hasOne CRUD improvements ([#9239](https://github.com/aws-amplify/amplify-js/issues/9239)) ([d521d17](https://github.com/aws-amplify/amplify-js/commit/d521d17c45a246c63c02a29e103e8a3db374c11e))

## [3.6.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.6.0...@aws-amplify/datastore@3.6.1) (2021-11-16)

**Note:** Version bump only for package @aws-amplify/datastore

# [3.6.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.5.2...@aws-amplify/datastore@3.6.0) (2021-11-12)

### Features

- **@aws-amplify/datastore:** ObserveQuery performance and type enhancements ([#9141](https://github.com/aws-amplify/amplify-js/issues/9141)) ([755ce09](https://github.com/aws-amplify/amplify-js/commit/755ce09f5152c54d215f023089f30b2c98ace33a))

## [3.5.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.5.1...@aws-amplify/datastore@3.5.2) (2021-11-09)

### Bug Fixes

- **@aws-amplify/datastore:** use forEach instead of map to iterate over unsubscribe callbacks ([#9146](https://github.com/aws-amplify/amplify-js/issues/9146)) ([ec6ee1c](https://github.com/aws-amplify/amplify-js/commit/ec6ee1c066a283e4e34a287db5712f2bb944e6ba))

### Reverts

- uuid dependency upgrade ([#9159](https://github.com/aws-amplify/amplify-js/issues/9159)) ([4ef8aa9](https://github.com/aws-amplify/amplify-js/commit/4ef8aa9c7c25dbe921fd02b6205b8defb93fbaec))

## [3.5.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.5.0...@aws-amplify/datastore@3.5.1) (2021-10-28)

**Note:** Version bump only for package @aws-amplify/datastore

# [3.5.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.4.8...@aws-amplify/datastore@3.5.0) (2021-10-21)

### Features

- **@aws-amplify/datastore:** observeQuery API ([#8864](https://github.com/aws-amplify/amplify-js/issues/8864)) ([25f06e3](https://github.com/aws-amplify/amplify-js/commit/25f06e3ad8bbcd5fc297c3da0936481b49aaa3a9))

## [3.4.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.4.7...@aws-amplify/datastore@3.4.8) (2021-10-07)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.4.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.4.6...@aws-amplify/datastore@3.4.7) (2021-09-30)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.4.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.4.5...@aws-amplify/datastore@3.4.6) (2021-09-24)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.4.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.4.4...@aws-amplify/datastore@3.4.5) (2021-09-22)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.4.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.4.3...@aws-amplify/datastore@3.4.4) (2021-09-17)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.4.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.4.2...@aws-amplify/datastore@3.4.3) (2021-09-09)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.4.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.4.1...@aws-amplify/datastore@3.4.2) (2021-09-07)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.4.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.4.0...@aws-amplify/datastore@3.4.1) (2021-09-04)

### Bug Fixes

- **@aws-amplify/datastore:** only stringify nested AWSJSON in mutation event ([#8844](https://github.com/aws-amplify/amplify-js/issues/8844)) ([0febaac](https://github.com/aws-amplify/amplify-js/commit/0febaac79af1b9fd0621dce1e63a139bebdb46f5))

# [3.4.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.3.3...@aws-amplify/datastore@3.4.0) (2021-09-02)

### Bug Fixes

- **@aws-amplify/datastore:** patch immer vuln ([#8841](https://github.com/aws-amplify/amplify-js/issues/8841)) ([6521a57](https://github.com/aws-amplify/amplify-js/commit/6521a576572f21a91738e2bdc37ffb21350392d0))
- **@aws-amplify/datastore:** remove conditional require ([#8828](https://github.com/aws-amplify/amplify-js/issues/8828)) ([48b76e1](https://github.com/aws-amplify/amplify-js/commit/48b76e10602b0b5cc9bc43b9b3abd653e27e1817))

### Features

- **@aws-amplify/datastore:** add SQLite storage adapter option for RN apps ([#8809](https://github.com/aws-amplify/amplify-js/issues/8809)) ([46ee5dd](https://github.com/aws-amplify/amplify-js/commit/46ee5dd91c61f49bad4da8286b2f97c737d96631))

## [3.3.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.3.2...@aws-amplify/datastore@3.3.3) (2021-08-26)

### Bug Fixes

- **@aws-amplify/datastore:** check read-only at instance level ([#8794](https://github.com/aws-amplify/amplify-js/issues/8794)) ([b278875](https://github.com/aws-amplify/amplify-js/commit/b278875491bf6959591d5aea6fbdddfc78f3fe9b))

## [3.3.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.3.1...@aws-amplify/datastore@3.3.2) (2021-08-19)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.3.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.3.0...@aws-amplify/datastore@3.3.1) (2021-08-12)

**Note:** Version bump only for package @aws-amplify/datastore

# [3.3.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.2.2...@aws-amplify/datastore@3.3.0) (2021-07-28)

### Features

- **@aws-amplify/datastore:** support lambda authorizers ([52d43cc](https://github.com/aws-amplify/amplify-js/commit/52d43cc73b459148f1ae81ab81d3a5365a4457e3))

## [3.2.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.2.1...@aws-amplify/datastore@3.2.2) (2021-07-22)

### Bug Fixes

- **@aws-amplify/datastore:** remove null properties from connected model instances ([#8623](https://github.com/aws-amplify/amplify-js/issues/8623)) ([569214c](https://github.com/aws-amplify/amplify-js/commit/569214c762bb3aace1ff96fcbe468780dcaabe35))

## [3.2.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.2.0...@aws-amplify/datastore@3.2.1) (2021-07-16)

**Note:** Version bump only for package @aws-amplify/datastore

# [3.2.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.1.2...@aws-amplify/datastore@3.2.0) (2021-07-08)

### Features

- **@aws-amplify/datastore:** expose timestamp fields and prevent writing to read-only fields ([#8509](https://github.com/aws-amplify/amplify-js/issues/8509)) ([10857d5](https://github.com/aws-amplify/amplify-js/commit/10857d5bbd6f7cb59a58641e0e8a3cb5dc0080e9))

## [3.1.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.1.1...@aws-amplify/datastore@3.1.2) (2021-06-24)

**Note:** Version bump only for package @aws-amplify/datastore

## [3.1.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.1.0...@aws-amplify/datastore@3.1.1) (2021-06-18)

**Note:** Version bump only for package @aws-amplify/datastore

# [3.1.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.0.3...@aws-amplify/datastore@3.1.0) (2021-06-10)

### Features

- **@aws-amplify/datastore:** include custom pk in update/delete mutations ([#8296](https://github.com/aws-amplify/amplify-js/issues/8296)) ([4a8475b](https://github.com/aws-amplify/amplify-js/commit/4a8475b5ba4da312c946c66a4fb1b5591dfe9adf))

## [3.0.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.0.1...@aws-amplify/datastore@3.0.3) (2021-05-26)

### Bug Fixes

- **@aws-amplify/datastore:** correct reachability unsubscribe behavior ([#8344](https://github.com/aws-amplify/amplify-js/issues/8344)) ([edf2b71](https://github.com/aws-amplify/amplify-js/commit/edf2b71a4ca3058883d27067fb6c87a9f3b339cb))
- **@aws-amplify/datastore:** coerce undefined field values to null ([#8301](https://github.com/aws-amplify/amplify-js/issues/8301)) ([396920b](https://github.com/aws-amplify/amplify-js/commit/396920bf53f139835473c0c08f4e5ab6f511867d))
- **@aws-amplify/datastore:** fix default error/conflict handler ([#8335](https://github.com/aws-amplify/amplify-js/issues/8335)) ([8d62d9d](https://github.com/aws-amplify/amplify-js/commit/8d62d9d9dd1d5934f40c0b800ab2440d805d4239))
- **@aws-amplify/datastore:** fixed return type for DS.delete() by ID ([#8311](https://github.com/aws-amplify/amplify-js/issues/8311)) ([e1624c1](https://github.com/aws-amplify/amplify-js/commit/e1624c17fae2edc6aa35904993171336fe9f597c))
- **@aws-amplify/datastore:** handle nullish values when using string predicate operators ([#8260](https://github.com/aws-amplify/amplify-js/issues/8260)) ([eb2942d](https://github.com/aws-amplify/amplify-js/commit/eb2942d436d48182f3e51cc163d2112b17656fa3))
- **@aws-amplify/datastore:** updates with composite keys ([#8253](https://github.com/aws-amplify/amplify-js/issues/8253)) ([3abfb8f](https://github.com/aws-amplify/amplify-js/commit/3abfb8fc68d916a5f22447652fe81bf81c6977dd))

## [3.0.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@3.0.0...@aws-amplify/datastore@3.0.1) (2021-05-14)

**Note:** Version bump only for package @aws-amplify/datastore

# [3.0.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.10.0...@aws-amplify/datastore@3.0.0) (2021-05-11)

- chore!: Upgrade to @react-native-async-storage/async-storage (#8250) ([1de4853](https://github.com/aws-amplify/amplify-js/commit/1de48531b68e3c53c3b7dbf4487da4578cb79888)), closes [#8250](https://github.com/aws-amplify/amplify-js/issues/8250)

### BREAKING CHANGES

- Upgrade from React Native AsyncStorage to @react-native-async-storage/async-storage

Co-authored-by: Ashish Nanda <ashish.nanda.5591@gmail.com>
Co-authored-by: Ivan Artemiev <29709626+iartemiev@users.noreply.github.com>

# [2.10.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.16...@aws-amplify/datastore@2.10.0) (2021-05-06)

### Bug Fixes

- **@aws-amplify/datastore:** correctly processing Delta Sync query response in RN ([#8196](https://github.com/aws-amplify/amplify-js/issues/8196)) ([9883974](https://github.com/aws-amplify/amplify-js/commit/98839741055ef9934565d49599e74c78e3812bba))
- **@aws-amplify/datastore:** fix hasOne delete ([#8191](https://github.com/aws-amplify/amplify-js/issues/8191)) ([d16a8fb](https://github.com/aws-amplify/amplify-js/commit/d16a8fbc5862281121812b1f8fc7af8bb001190d))
- **@aws-amplify/datastore:** log subscription error instead of throwing ([#8229](https://github.com/aws-amplify/amplify-js/issues/8229)) ([403de44](https://github.com/aws-amplify/amplify-js/commit/403de44496d17614a542fbcb98bab8b99898bab6))
- **@aws-amplify/datastore:** Update CCI config & logger warning format ([#8231](https://github.com/aws-amplify/amplify-js/issues/8231)) ([d3462aa](https://github.com/aws-amplify/amplify-js/commit/d3462aab1dd4916dd757bc1c80f9a944e0bb82dd))

### Features

- **@aws-amplify/datastore:** DataStore - Multi-Auth ([#8008](https://github.com/aws-amplify/amplify-js/issues/8008)) ([dedd564](https://github.com/aws-amplify/amplify-js/commit/dedd5641dfcfce209433088fe9570874cd810997))

## [2.9.16](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.15...@aws-amplify/datastore@2.9.16) (2021-04-15)

### Bug Fixes

- **@aws-amplify/datastore:** add additional type check to util.objectsEqual ([#8027](https://github.com/aws-amplify/amplify-js/issues/8027)) ([dee1971](https://github.com/aws-amplify/amplify-js/commit/dee1971285682170dc1828204273d34a69145aa3))
- **@aws-amplify/datastore:** consecutive saves ([#8000](https://github.com/aws-amplify/amplify-js/issues/8000)) ([7b478a5](https://github.com/aws-amplify/amplify-js/commit/7b478a58b73d8f321523d3a80a9b85e88afcc5d0))
- **@aws-amplify/datastore:** consecutive saves 2 ([#8038](https://github.com/aws-amplify/amplify-js/issues/8038)) ([a15b8f0](https://github.com/aws-amplify/amplify-js/commit/a15b8f044597da68442e4c51e67c35772aed1d7c))
- **@aws-amplify/datastore:** handle merging queued create with incoming update ([#8102](https://github.com/aws-amplify/amplify-js/issues/8102)) ([d84cf34](https://github.com/aws-amplify/amplify-js/commit/d84cf34d32e077554951e2fd7a383c6cfe3f536c))
- **@aws-amplify/datastore:** Retry mutation after GraphQL request timeout due to bad network condition. ([#6542](https://github.com/aws-amplify/amplify-js/issues/6542)) ([9fe6b7f](https://github.com/aws-amplify/amplify-js/commit/9fe6b7fa58aadb061a742b32c6a9cc1fd76dae6d))

## [2.9.15](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.14...@aws-amplify/datastore@2.9.15) (2021-03-25)

### Bug Fixes

- **@aws-amplify/datastore:** fix consecutive updates ([#7354](https://github.com/aws-amplify/amplify-js/issues/7354)) ([efd2e41](https://github.com/aws-amplify/amplify-js/commit/efd2e41d13fa6417ecddf153d7d0461060e45621))
- **@aws-amplify/datastore:** keep syncing when subs disabled ([#7987](https://github.com/aws-amplify/amplify-js/issues/7987)) ([0e8968f](https://github.com/aws-amplify/amplify-js/commit/0e8968f9125b1b5f76389abe3d77986c1f65e32f))
- **@aws-amplify/datastore:** update mutation input - use diff with DB instead of patches ([#7935](https://github.com/aws-amplify/amplify-js/issues/7935)) ([638c94d](https://github.com/aws-amplify/amplify-js/commit/638c94de30df179ef5f0d03ac8c97cecb683bb53))

## [2.9.14](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.13...@aws-amplify/datastore@2.9.14) (2021-03-18)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.9.13](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.12...@aws-amplify/datastore@2.9.13) (2021-03-12)

### Bug Fixes

- **@aws-amplify/datastore:** handle sync query unauthorized ([#7926](https://github.com/aws-amplify/amplify-js/issues/7926)) ([4b37112](https://github.com/aws-amplify/amplify-js/commit/4b371125fa60362b2e4a648e0cb18b8f8a853956))

## [2.9.12](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.11...@aws-amplify/datastore@2.9.12) (2021-03-08)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.9.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.10...@aws-amplify/datastore@2.9.11) (2021-03-03)

### Bug Fixes

- **@aws-amplify/datastore:** return partial data when available ([#7775](https://github.com/aws-amplify/amplify-js/issues/7775)) ([715aa7e](https://github.com/aws-amplify/amplify-js/commit/715aa7e1d8ea1797784d37ab706c12b133fca4f0))

## [2.9.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.9...@aws-amplify/datastore@2.9.10) (2021-02-25)

### Bug Fixes

- **@aws-amplify/datastore:** improve IDB query performance ([#7746](https://github.com/aws-amplify/amplify-js/issues/7746)) ([5b87ad4](https://github.com/aws-amplify/amplify-js/commit/5b87ad485be5521a3ca91aa7bb00bba178e6c8b9))

## [2.9.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.8...@aws-amplify/datastore@2.9.9) (2021-02-18)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.9.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.7...@aws-amplify/datastore@2.9.8) (2021-02-15)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.9.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.6...@aws-amplify/datastore@2.9.7) (2021-02-09)

### Bug Fixes

- **@aws-amplify/datastore:** align AWSTime validation with AppSync ([#7717](https://github.com/aws-amplify/amplify-js/issues/7717)) ([feae503](https://github.com/aws-amplify/amplify-js/commit/feae503ba2ad22738e4a16639441f4dec6077f7a))

## [2.9.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.5...@aws-amplify/datastore@2.9.6) (2021-02-03)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.9.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.4...@aws-amplify/datastore@2.9.5) (2021-02-01)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.9.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.3...@aws-amplify/datastore@2.9.4) (2021-01-29)

### Bug Fixes

- **@aws-amplify/datastore:** only include changed fields in update mutation input ([#7466](https://github.com/aws-amplify/amplify-js/issues/7466)) ([7b5b23f](https://github.com/aws-amplify/amplify-js/commit/7b5b23f9fa6f1c4934c631ab6bfc363b8d3eeac2))

## [2.9.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.2...@aws-amplify/datastore@2.9.3) (2021-01-07)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.9.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.1...@aws-amplify/datastore@2.9.2) (2020-12-17)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.9.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.9.0...@aws-amplify/datastore@2.9.1) (2020-12-10)

### Bug Fixes

- **@aws-amplify/datastore:** check auth config before getting token ([#7325](https://github.com/aws-amplify/amplify-js/issues/7325)) ([d9aa328](https://github.com/aws-amplify/amplify-js/commit/d9aa32837f15f408daba0a0104bb27042b9331da))
- **@aws-amplify/datastore:** Fix ctlSubsSubscription not getting unsubscribed when device goes offline ([#7250](https://github.com/aws-amplify/amplify-js/issues/7250)) ([4d0a2e3](https://github.com/aws-amplify/amplify-js/commit/4d0a2e34a21eb96b9085efcdd8f7846734bf33f7))
- **@aws-amplify/datastore:** fix custom ownerField selection set ([#7317](https://github.com/aws-amplify/amplify-js/issues/7317)) ([0b82781](https://github.com/aws-amplify/amplify-js/commit/0b82781e946e6bef15f7b162d0ea538fc8ac5100))
- **@aws-amplify/datastore:** remove netinfo from peer deps to prevent npm7 error ([#7349](https://github.com/aws-amplify/amplify-js/issues/7349)) ([88e2413](https://github.com/aws-amplify/amplify-js/commit/88e2413701cae673043c2fe42b490d279e7e51c9))

# [2.9.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.8.1...@aws-amplify/datastore@2.9.0) (2020-11-30)

### Bug Fixes

- **@aws-amplify/datastore:** handle groupClaim as plain string ([#7261](https://github.com/aws-amplify/amplify-js/issues/7261)) ([63e5baa](https://github.com/aws-amplify/amplify-js/commit/63e5baa4293bf6688962007137377d19c5ef8904))

### Features

- **@aws-amplify/datastore:** handle sessionId ([#7304](https://github.com/aws-amplify/amplify-js/issues/7304)) ([6e28eaf](https://github.com/aws-amplify/amplify-js/commit/6e28eaf37525ce231d7793bf82a960046fc7f8f4))

## [2.8.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.8.0...@aws-amplify/datastore@2.8.1) (2020-11-23)

### Bug Fixes

- **@aws-amplify/datastore:** use default auth for subscriptions ([#7172](https://github.com/aws-amplify/amplify-js/issues/7172)) ([7428c74](https://github.com/aws-amplify/amplify-js/commit/7428c74bb7402fe230def58e501d6e58ec351f3e))

# [2.8.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.7.3...@aws-amplify/datastore@2.8.0) (2020-11-20)

### Bug Fixes

- **@aws-amplify/datastore:** extend Lookup type to allow Predicates.ALL ([#7218](https://github.com/aws-amplify/amplify-js/issues/7218)) ([be1a746](https://github.com/aws-amplify/amplify-js/commit/be1a746fe7c0e8a41e4c773c03689a6d6d76b380))
- **@aws-amplify/datastore:** fix sel. sync delta ([#7200](https://github.com/aws-amplify/amplify-js/issues/7200)) ([dbd4629](https://github.com/aws-amplify/amplify-js/commit/dbd46299af9c558251b8c652c3e50208982655c8))
- **@aws-amplify/datastore:** fix validation for array with optional element ([#7216](https://github.com/aws-amplify/amplify-js/issues/7216)) ([31c7199](https://github.com/aws-amplify/amplify-js/commit/31c7199c1c0abe77f59ac24739667503f266b4d1))
- **@aws-amplify/datastore:** handle groupClaim as string ([#7208](https://github.com/aws-amplify/amplify-js/issues/7208)) ([17b62dd](https://github.com/aws-amplify/amplify-js/commit/17b62dd216f7fdf5b21ae9ba2a2c170fb86a4d73))

### Features

- **@aws-amplify/datastore:** add local validations for AppSync scalars ([#7212](https://github.com/aws-amplify/amplify-js/issues/7212)) ([f277a7e](https://github.com/aws-amplify/amplify-js/commit/f277a7e4bb9d4cf67e2b4353c09b1e3f92bcd5c2))
- **@aws-amplify/datastore:** add local validations for AppSync scalars (update) ([#7234](https://github.com/aws-amplify/amplify-js/issues/7234)) ([7477d27](https://github.com/aws-amplify/amplify-js/commit/7477d272587212c2a3cf0e86806f8ff4a03881e0))

## [2.7.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.7.2...@aws-amplify/datastore@2.7.3) (2020-11-13)

### Bug Fixes

- **@aws-amplify/datastore:** add implicit owner to selection set ([#7159](https://github.com/aws-amplify/amplify-js/issues/7159)) ([256ffa8](https://github.com/aws-amplify/amplify-js/commit/256ffa8b20d41a9e97a7dc2db38a3453d885c0cd))

## [2.7.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.7.1...@aws-amplify/datastore@2.7.2) (2020-11-03)

### Bug Fixes

- **@aws-amplify/datastore:** fix syncExpression types ([#7097](https://github.com/aws-amplify/amplify-js/issues/7097)) ([947197d](https://github.com/aws-amplify/amplify-js/commit/947197d39e4136af1d114ef716fe77725712f51f))

## [2.7.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.7.0...@aws-amplify/datastore@2.7.1) (2020-10-31)

### Bug Fixes

- **amazon-cognito-identity-js:** update random implementation ([#7090](https://github.com/aws-amplify/amplify-js/issues/7090)) ([7048453](https://github.com/aws-amplify/amplify-js/commit/70484532da8a9953384b00b223b2b3ba0c0e845e))

# [2.7.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.6.1...@aws-amplify/datastore@2.7.0) (2020-10-29)

### Bug Fixes

- **@aws-amplify/datastore:** fix OIDC group auth rules ([#7011](https://github.com/aws-amplify/amplify-js/issues/7011)) ([34de0f2](https://github.com/aws-amplify/amplify-js/commit/34de0f252ddea559a6bc959610522cc19fe340f6))
- **@aws-amplify/datastore:** initialize syncPredicates to empty WeakMap ([#7078](https://github.com/aws-amplify/amplify-js/issues/7078)) ([45d52da](https://github.com/aws-amplify/amplify-js/commit/45d52da6cec9b5e546c26e299d47e4d0b2879a7f))
- **@aws-amplify/datastore:** return empty WeakMap ([#7079](https://github.com/aws-amplify/amplify-js/issues/7079)) ([cf511b8](https://github.com/aws-amplify/amplify-js/commit/cf511b8d3deaa58edcce8d1ec015548a801c212b))
- **@aws-amplify/datastore:** validate model fields to allow undefined ([#7044](https://github.com/aws-amplify/amplify-js/issues/7044)) ([958f61e](https://github.com/aws-amplify/amplify-js/commit/958f61ef2918728cc46b9b210d60e868edd87f39))

### Features

- **@aws-amplify/datastore:** add Selective Sync ([#7001](https://github.com/aws-amplify/amplify-js/issues/7001)) ([8fa348b](https://github.com/aws-amplify/amplify-js/commit/8fa348b8ba708434992d97557b0fceebbf7abe9a))
- **@aws-amplify/datastore:** selective sync enhancements ([#7083](https://github.com/aws-amplify/amplify-js/issues/7083)) ([2a4d3fd](https://github.com/aws-amplify/amplify-js/commit/2a4d3fde1b23e5be84f66721d3ef5854663081d1))

## [2.6.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.6.0...@aws-amplify/datastore@2.6.1) (2020-10-15)

### Bug Fixes

- **@aws-amplify/datastore:** fix DS subscriptions involving read operation ([#6954](https://github.com/aws-amplify/amplify-js/issues/6954)) ([2f74c6b](https://github.com/aws-amplify/amplify-js/commit/2f74c6b74d38af570017139f2ba8269dc1009135))

# [2.6.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.5.2...@aws-amplify/datastore@2.6.0) (2020-10-01)

### Bug Fixes

- **@aws-amplify/datastore:** add token to currentAuthenticatedUser for OIDC ([#6858](https://github.com/aws-amplify/amplify-js/issues/6858)) ([61f7478](https://github.com/aws-amplify/amplify-js/commit/61f7478609fce7dd2f25c562aeb887d3f3db4a67))
- **@aws-amplify/datastore:** check for token before getting payload ([#6893](https://github.com/aws-amplify/amplify-js/issues/6893)) ([880e1da](https://github.com/aws-amplify/amplify-js/commit/880e1da9d85b1caa3992bc7b4b6ace1a32eee525))
- **@aws-amplify/datastore:** correct validation for array values in models ([#6784](https://github.com/aws-amplify/amplify-js/issues/6784)) ([95f73e2](https://github.com/aws-amplify/amplify-js/commit/95f73e2d1b8eab2d9b8fc474ca2986f84d2a68e3))
- **@aws-amplify/datastore:** fix import isNullOrUndefined ([#6883](https://github.com/aws-amplify/amplify-js/issues/6883)) ([a55168b](https://github.com/aws-amplify/amplify-js/commit/a55168b0c6b794b337a5b2258fc22b5721a82e85))

### Features

- **@aws-amplify/datastore:** support indexeddb adapter on web worker ([#6874](https://github.com/aws-amplify/amplify-js/issues/6874)) ([e43e181](https://github.com/aws-amplify/amplify-js/commit/e43e18195ca201fa61bd0dfb1b18c06c3262f825))

## [2.5.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.5.1...@aws-amplify/datastore@2.5.2) (2020-09-25)

### Bug Fixes

- Add files with Amplify.register to sideEffects array ([#6867](https://github.com/aws-amplify/amplify-js/issues/6867)) ([58ddbf8](https://github.com/aws-amplify/amplify-js/commit/58ddbf8811e44695d97b6ab8be8f7cd2a2242921))
- **@aws-amplify/datastore:** use runExclusive when enqueuing ([#6828](https://github.com/aws-amplify/amplify-js/issues/6828)) ([26ce5df](https://github.com/aws-amplify/amplify-js/commit/26ce5dfb0270009fc10f003f5627046ddaf5ae4e))

## [2.5.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.5.0...@aws-amplify/datastore@2.5.1) (2020-09-16)

**Note:** Version bump only for package @aws-amplify/datastore

# [2.5.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.4.0...@aws-amplify/datastore@2.5.0) (2020-09-15)

### Bug Fixes

- **@aws-amplify/datastore:** Allow subscribing and querying with partial auth ([#6458](https://github.com/aws-amplify/amplify-js/issues/6458)) ([6abbf50](https://github.com/aws-amplify/amplify-js/commit/6abbf5053978420ef008fc45968a54d0762943de))

### Features

- **@aws-amplify/datastore:** add query sorting ([#6785](https://github.com/aws-amplify/amplify-js/issues/6785)) ([d9c2f5e](https://github.com/aws-amplify/amplify-js/commit/d9c2f5efbd5ad5dd97e441d7f453f8358f615199))

# [2.4.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.3.1...@aws-amplify/datastore@2.4.0) (2020-09-10)

### Features

- **@aws-amplify/datastore:** Add SSR support for DataStore ([#6726](https://github.com/aws-amplify/amplify-js/issues/6726)) ([e56aba6](https://github.com/aws-amplify/amplify-js/commit/e56aba642acc7eb3482f0e69454a530409d1b3ac))

## [2.3.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.3.0...@aws-amplify/datastore@2.3.1) (2020-09-03)

**Note:** Version bump only for package @aws-amplify/datastore

# [2.3.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.11...@aws-amplify/datastore@2.3.0) (2020-09-03)

### Bug Fixes

- **@aws-amplify/datastore:** DataStore regression with AsyncStorage ([#6712](https://github.com/aws-amplify/amplify-js/issues/6712)) ([7059556](https://github.com/aws-amplify/amplify-js/commit/7059556f693b4a52143ecaa9934a14f7195caee8))

### Features

- **SSR:** withSSRContext ([#6146](https://github.com/aws-amplify/amplify-js/issues/6146)) ([1cb1afd](https://github.com/aws-amplify/amplify-js/commit/1cb1afd1e56135908dceb2ef6403f0b3e78067fe))

## [2.2.11](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.10...@aws-amplify/datastore@2.2.11) (2020-09-01)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.2.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.9...@aws-amplify/datastore@2.2.10) (2020-08-19)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.2.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.8...@aws-amplify/datastore@2.2.9) (2020-08-06)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.2.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.7...@aws-amplify/datastore@2.2.8) (2020-07-27)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.2.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.6...@aws-amplify/datastore@2.2.7) (2020-07-22)

### Bug Fixes

- **@aws-amplify/datastore:** call disconnectionHandler on subscription error ([#6366](https://github.com/aws-amplify/amplify-js/issues/6366)) ([a7feace](https://github.com/aws-amplify/amplify-js/commit/a7feacea4ed506340d250249d0b15286fe3ef5fa))

## [2.2.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.5...@aws-amplify/datastore@2.2.6) (2020-07-09)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.2.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.4...@aws-amplify/datastore@2.2.5) (2020-07-07)

### Bug Fixes

- **@aws-amplify/datastore:** give precedence to config.conflictHandler ([#6237](https://github.com/aws-amplify/amplify-js/issues/6237)) ([d616b76](https://github.com/aws-amplify/amplify-js/commit/d616b76aa054930bc816ad13be281bd9bd07f64c))

## [2.2.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.3...@aws-amplify/datastore@2.2.4) (2020-06-18)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.2.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.2...@aws-amplify/datastore@2.2.3) (2020-06-09)

### Bug Fixes

- **@aws-amplify/datastore:** AsyncStorage - Save connections when doing batchSave ([#6027](https://github.com/aws-amplify/amplify-js/issues/6027)) ([d9a5b3e](https://github.com/aws-amplify/amplify-js/commit/d9a5b3ee2309f1703a349a8d39b2a65dcaac5f61))
- **@aws-amplify/datastore:** IndexedDB - Save connections when doing batchSave ([#6029](https://github.com/aws-amplify/amplify-js/issues/6029)) ([1a6e0ec](https://github.com/aws-amplify/amplify-js/commit/1a6e0ecff70556559d8fef6028ec4011775f5b95)), closes [#6027](https://github.com/aws-amplify/amplify-js/issues/6027)
- **@aws-amplify/datastore:** RN - fix queries don't do anything on the first load of the application ([#6010](https://github.com/aws-amplify/amplify-js/issues/6010)) ([b5347ab](https://github.com/aws-amplify/amplify-js/commit/b5347ab620763551060741a1b78e47c1abf7ee6a)), closes [#5991](https://github.com/aws-amplify/amplify-js/issues/5991)
- **@aws-amplify/datastore:** Save parent model with flattened ids for relations when batch saving results from GraphQL ([#6035](https://github.com/aws-amplify/amplify-js/issues/6035)) ([084b265](https://github.com/aws-amplify/amplify-js/commit/084b2653219d5b8cc0f952ebb74039b2a97e6261))

## [2.2.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.1...@aws-amplify/datastore@2.2.2) (2020-06-04)

### Bug Fixes

- **@aws-amplify/datastore:** Fix count when there is a mutation in the outbox ([#6001](https://github.com/aws-amplify/amplify-js/issues/6001)) ([d2fc76e](https://github.com/aws-amplify/amplify-js/commit/d2fc76e789ee1bcaf6c112e7b661089d746ac355))

## [2.2.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.0...@aws-amplify/datastore@2.2.1) (2020-06-03)

### Bug Fixes

- **@aws-amplify/datastore:** Fix performance undefined variable in RN ([#5984](https://github.com/aws-amplify/amplify-js/issues/5984)) ([da2726d](https://github.com/aws-amplify/amplify-js/commit/da2726d029c63d7472a32deffd1431322ec628ad))
- **@aws-amplify/datastore:** Fix potential NPE ([#5993](https://github.com/aws-amplify/amplify-js/issues/5993)) ([ccb6906](https://github.com/aws-amplify/amplify-js/commit/ccb69065a3d92ec4ec79184b0d55f069bb652980))

# [2.2.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.1.2...@aws-amplify/datastore@2.2.0) (2020-06-02)

### Bug Fixes

- **@aws-amplify/datastore:** Allow partial subscriptions. ([#5968](https://github.com/aws-amplify/amplify-js/issues/5968)) ([3331e9a](https://github.com/aws-amplify/amplify-js/commit/3331e9a713b38bb672aca5dc667ecef30b8820ce))

### Features

- **@aws-amplify/datastore:** Sync Status Notification. Performance Improvements. ([#5942](https://github.com/aws-amplify/amplify-js/issues/5942)) ([67fac50](https://github.com/aws-amplify/amplify-js/commit/67fac50cd734338ac76797d06111fc5ca911bd48))

## [2.1.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.1.1...@aws-amplify/datastore@2.1.2) (2020-05-26)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.1.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.1.0...@aws-amplify/datastore@2.1.1) (2020-05-22)

### Bug Fixes

- **@aws-amplify/datastore:** Fix subscription creation with model subscription level is public ([#5390](https://github.com/aws-amplify/amplify-js/issues/5390)) ([fff7daa](https://github.com/aws-amplify/amplify-js/commit/fff7daa25cab50933a149e88a7b67a4d83be0089))

# [2.1.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.10...@aws-amplify/datastore@2.1.0) (2020-05-14)

### Bug Fixes

- require cycles in various packages ([#5372](https://github.com/aws-amplify/amplify-js/issues/5372)) ([b48c26d](https://github.com/aws-amplify/amplify-js/commit/b48c26d198cc25dd92f1515ddf2a97deec5c9783))

### Features

- **@aws-amplify/datastore:** enable keyName relations ([#5778](https://github.com/aws-amplify/amplify-js/issues/5778)) ([9019acf](https://github.com/aws-amplify/amplify-js/commit/9019acfd180d3e569e64c999fd216b16a9d6b799))

## [2.0.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.9...@aws-amplify/datastore@2.0.10) (2020-04-30)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.0.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.8...@aws-amplify/datastore@2.0.9) (2020-04-24)

### Bug Fixes

- **@aws-amplify/datastore:** Improve query and observe typings ([#5468](https://github.com/aws-amplify/amplify-js/issues/5468)) ([84286be](https://github.com/aws-amplify/amplify-js/commit/84286be109d7f50eac83a9694e75b61500cc8a83))

## [2.0.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.7...@aws-amplify/datastore@2.0.8) (2020-04-14)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.0.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.6...@aws-amplify/datastore@2.0.7) (2020-04-08)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.0.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.5...@aws-amplify/datastore@2.0.6) (2020-04-07)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.0.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.4...@aws-amplify/datastore@2.0.5) (2020-04-03)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.0.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.3...@aws-amplify/datastore@2.0.4) (2020-04-02)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.0.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.2...@aws-amplify/datastore@2.0.3) (2020-04-01)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.0.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.1...@aws-amplify/datastore@2.0.2) (2020-04-01)

**Note:** Version bump only for package @aws-amplify/datastore

## [2.0.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@1.2.0...@aws-amplify/datastore@2.0.1) (2020-03-31)

**Note:** Version bump only for package @aws-amplify/datastore

# [1.2.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@1.1.0...@aws-amplify/datastore@1.2.0) (2020-03-30)

### Bug Fixes

- **@aws-amplify/datastore:** Make save return a single model instead of array ([#5199](https://github.com/aws-amplify/amplify-js/issues/5199)) ([1d0b8e1](https://github.com/aws-amplify/amplify-js/commit/1d0b8e13af483b7ab47d9b4bcd6aa00d8e67d9f1)), closes [#5099](https://github.com/aws-amplify/amplify-js/issues/5099)

### Features

- **@aws-amplify/datastore:** configurable sync pagination limit ([#5181](https://github.com/aws-amplify/amplify-js/issues/5181)) ([a4f518b](https://github.com/aws-amplify/amplify-js/commit/a4f518b42e192c894300225a4c5608d397eb6816))

# [1.1.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@1.0.8...@aws-amplify/datastore@1.1.0) (2020-03-25)

### Bug Fixes

- **@aws-amplify/datastore:** Fix query and delete types ([#5032](https://github.com/aws-amplify/amplify-js/issues/5032)) ([fdca554](https://github.com/aws-amplify/amplify-js/commit/fdca5541372662ffa1d932b665c481a78e4ccdc7)), closes [#4827](https://github.com/aws-amplify/amplify-js/issues/4827)
- **@aws-amplify/datastore:** Storage should be re-initialized after DataStore.clear() ([#5083](https://github.com/aws-amplify/amplify-js/issues/5083)) ([0ddb6af](https://github.com/aws-amplify/amplify-js/commit/0ddb6af3163fc624cc4f320ecf2b2463d7d6b102)), closes [#5076](https://github.com/aws-amplify/amplify-js/issues/5076)

### Features

- **@aws-amplify/datastore:** Support non-[@model](https://github.com/model) types in DataStore ([#5128](https://github.com/aws-amplify/amplify-js/issues/5128)) ([b884ea2](https://github.com/aws-amplify/amplify-js/commit/b884ea2ce730d8ce981a5921f74f8f37338f6f42))

## [1.0.8](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@1.0.7...@aws-amplify/datastore@1.0.8) (2020-02-28)

**Note:** Version bump only for package @aws-amplify/datastore

## [1.0.7](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@1.0.6...@aws-amplify/datastore@1.0.7) (2020-02-14)

**Note:** Version bump only for package @aws-amplify/datastore

## [1.0.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@1.0.4...@aws-amplify/datastore@1.0.6) (2020-02-07)

**Note:** Version bump only for package @aws-amplify/datastore

## [1.0.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@1.0.3...@aws-amplify/datastore@1.0.4) (2020-01-10)

### Bug Fixes

- [#4311](https://github.com/aws-amplify/amplify-js/issues/4311) Update main entry field to point to CJS builds instead of webpack bundles ([#4678](https://github.com/aws-amplify/amplify-js/issues/4678)) ([54fbdf4](https://github.com/aws-amplify/amplify-js/commit/54fbdf4b1393567735fb7b5f4144db273f1a5f6a))

## [1.0.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@1.0.2...@aws-amplify/datastore@1.0.3) (2019-12-18)

**Note:** Version bump only for package @aws-amplify/datastore

## [1.0.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@1.0.1...@aws-amplify/datastore@1.0.2) (2019-12-04)

### Bug Fixes

- **@aws-amplify/datastore:** Validate arrays of scalars in model constructor ([#4508](https://github.com/aws-amplify/amplify-js/issues/4508)) ([8d2ba6e](https://github.com/aws-amplify/amplify-js/commit/8d2ba6e85031a7880d2b573e1f68108d22a7de54))

## 1.0.1 (2019-12-03)

**Note:** Version bump only for package @aws-amplify/datastore
