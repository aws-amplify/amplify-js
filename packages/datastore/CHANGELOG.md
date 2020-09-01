# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

* **@aws-amplify/datastore:** call disconnectionHandler on subscription error ([#6366](https://github.com/aws-amplify/amplify-js/issues/6366)) ([a7feace](https://github.com/aws-amplify/amplify-js/commit/a7feacea4ed506340d250249d0b15286fe3ef5fa))





## [2.2.6](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.5...@aws-amplify/datastore@2.2.6) (2020-07-09)

**Note:** Version bump only for package @aws-amplify/datastore





## [2.2.5](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.4...@aws-amplify/datastore@2.2.5) (2020-07-07)


### Bug Fixes

* **@aws-amplify/datastore:** give precedence to config.conflictHandler ([#6237](https://github.com/aws-amplify/amplify-js/issues/6237)) ([d616b76](https://github.com/aws-amplify/amplify-js/commit/d616b76aa054930bc816ad13be281bd9bd07f64c))





## [2.2.4](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.3...@aws-amplify/datastore@2.2.4) (2020-06-18)

**Note:** Version bump only for package @aws-amplify/datastore





## [2.2.3](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.2...@aws-amplify/datastore@2.2.3) (2020-06-09)


### Bug Fixes

* **@aws-amplify/datastore:** AsyncStorage - Save connections when doing batchSave ([#6027](https://github.com/aws-amplify/amplify-js/issues/6027)) ([d9a5b3e](https://github.com/aws-amplify/amplify-js/commit/d9a5b3ee2309f1703a349a8d39b2a65dcaac5f61))
* **@aws-amplify/datastore:** IndexedDB - Save connections when doing batchSave ([#6029](https://github.com/aws-amplify/amplify-js/issues/6029)) ([1a6e0ec](https://github.com/aws-amplify/amplify-js/commit/1a6e0ecff70556559d8fef6028ec4011775f5b95)), closes [#6027](https://github.com/aws-amplify/amplify-js/issues/6027)
* **@aws-amplify/datastore:** RN - fix queries don't do anything on the first load of the application ([#6010](https://github.com/aws-amplify/amplify-js/issues/6010)) ([b5347ab](https://github.com/aws-amplify/amplify-js/commit/b5347ab620763551060741a1b78e47c1abf7ee6a)), closes [#5991](https://github.com/aws-amplify/amplify-js/issues/5991)
* **@aws-amplify/datastore:** Save parent model with flattened ids for relations when batch saving results from GraphQL ([#6035](https://github.com/aws-amplify/amplify-js/issues/6035)) ([084b265](https://github.com/aws-amplify/amplify-js/commit/084b2653219d5b8cc0f952ebb74039b2a97e6261))





## [2.2.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.1...@aws-amplify/datastore@2.2.2) (2020-06-04)


### Bug Fixes

* **@aws-amplify/datastore:** Fix count when there is a mutation in the outbox ([#6001](https://github.com/aws-amplify/amplify-js/issues/6001)) ([d2fc76e](https://github.com/aws-amplify/amplify-js/commit/d2fc76e789ee1bcaf6c112e7b661089d746ac355))





## [2.2.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.2.0...@aws-amplify/datastore@2.2.1) (2020-06-03)


### Bug Fixes

* **@aws-amplify/datastore:** Fix performance undefined variable in RN ([#5984](https://github.com/aws-amplify/amplify-js/issues/5984)) ([da2726d](https://github.com/aws-amplify/amplify-js/commit/da2726d029c63d7472a32deffd1431322ec628ad))
* **@aws-amplify/datastore:** Fix potential NPE ([#5993](https://github.com/aws-amplify/amplify-js/issues/5993)) ([ccb6906](https://github.com/aws-amplify/amplify-js/commit/ccb69065a3d92ec4ec79184b0d55f069bb652980))





# [2.2.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.1.2...@aws-amplify/datastore@2.2.0) (2020-06-02)


### Bug Fixes

* **@aws-amplify/datastore:** Allow partial subscriptions. ([#5968](https://github.com/aws-amplify/amplify-js/issues/5968)) ([3331e9a](https://github.com/aws-amplify/amplify-js/commit/3331e9a713b38bb672aca5dc667ecef30b8820ce))


### Features

* **@aws-amplify/datastore:** Sync Status Notification. Performance Improvements. ([#5942](https://github.com/aws-amplify/amplify-js/issues/5942)) ([67fac50](https://github.com/aws-amplify/amplify-js/commit/67fac50cd734338ac76797d06111fc5ca911bd48))





## [2.1.2](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.1.1...@aws-amplify/datastore@2.1.2) (2020-05-26)

**Note:** Version bump only for package @aws-amplify/datastore





## [2.1.1](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.1.0...@aws-amplify/datastore@2.1.1) (2020-05-22)


### Bug Fixes

* **@aws-amplify/datastore:** Fix subscription creation with model subscription level is public ([#5390](https://github.com/aws-amplify/amplify-js/issues/5390)) ([fff7daa](https://github.com/aws-amplify/amplify-js/commit/fff7daa25cab50933a149e88a7b67a4d83be0089))





# [2.1.0](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.10...@aws-amplify/datastore@2.1.0) (2020-05-14)


### Bug Fixes

* require cycles in various packages ([#5372](https://github.com/aws-amplify/amplify-js/issues/5372)) ([b48c26d](https://github.com/aws-amplify/amplify-js/commit/b48c26d198cc25dd92f1515ddf2a97deec5c9783))


### Features

* **@aws-amplify/datastore:** enable keyName relations ([#5778](https://github.com/aws-amplify/amplify-js/issues/5778)) ([9019acf](https://github.com/aws-amplify/amplify-js/commit/9019acfd180d3e569e64c999fd216b16a9d6b799))





## [2.0.10](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.9...@aws-amplify/datastore@2.0.10) (2020-04-30)

**Note:** Version bump only for package @aws-amplify/datastore





## [2.0.9](https://github.com/aws-amplify/amplify-js/compare/@aws-amplify/datastore@2.0.8...@aws-amplify/datastore@2.0.9) (2020-04-24)


### Bug Fixes

* **@aws-amplify/datastore:** Improve query and observe typings ([#5468](https://github.com/aws-amplify/amplify-js/issues/5468)) ([84286be](https://github.com/aws-amplify/amplify-js/commit/84286be109d7f50eac83a9694e75b61500cc8a83))





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
