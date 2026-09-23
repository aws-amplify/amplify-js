// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Facade-parity regression tests (e2e run 33638708348).
 *
 * Real apps configure Amplify through the `aws-amplify` facade, which sets
 * the GLOBAL AmplifyContext and no longer populates the legacy core
 * `Amplify` singleton's instance state. DataStore used to read its AppSync
 * config from `Amplify.getConfig()` (the singleton), so under facade-only
 * configuration it saw an empty config and never reached ready.
 *
 * These tests configure ONLY a global context — the core singleton is never
 * configured — and assert DataStore's config resolution picks it up, plus
 * that the pre-configure path still degrades silently (DataStore waits for
 * the 'configure' Hub event; it must not throw).
 */

type DataStoreWithPrivates = {
	configure(config?: Record<string, unknown>): void;
	amplifyConfig: Record<string, unknown>;
};

describe('DataStore facade-parity configuration (global context only)', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	test('DataStore.configure() reads API.GraphQL config from the global context without the core singleton being configured', () => {
		// Establish ONLY a global context on the fresh module graph — the core
		// `Amplify` singleton is intentionally never configured, matching how
		// the `aws-amplify` facade configures real apps.
		const { setGlobalContext } = require('@aws-amplify/core/internals/utils');
		const { createTestCtx } = require('./helpers/ctx');
		setGlobalContext(createTestCtx('https://facade-parity.example/graphql'));

		const { DataStore } = require('../src/datastore/datastore');
		const dataStore = DataStore as DataStoreWithPrivates;

		dataStore.configure({});

		expect(dataStore.amplifyConfig.aws_appsync_graphqlEndpoint).toBe(
			'https://facade-parity.example/graphql',
		);
		expect(dataStore.amplifyConfig.aws_appsync_authenticationType).toBe(
			'apiKey',
		);
		expect(dataStore.amplifyConfig.aws_appsync_region).toBe('us-west-2');
	});

	test('DataStore.configure() before Amplify.configure() does not throw and leaves the AppSync config empty (v6 pre-configure parity)', () => {
		const {
			clearGlobalContext,
		} = require('@aws-amplify/core/internals/utils');
		clearGlobalContext();

		const { DataStore } = require('../src/datastore/datastore');
		const dataStore = DataStore as DataStoreWithPrivates;

		expect(() => {
			dataStore.configure({});
		}).not.toThrow();
		expect(
			dataStore.amplifyConfig.aws_appsync_graphqlEndpoint,
		).toBeUndefined();
	});
});
