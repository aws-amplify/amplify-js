// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createGlobalSettings } from '../../src/adapter-core/globalSettings';

describe('createGlobalSettings', () => {
	it('defaults to server-side auth disabled', () => {
		const gs = createGlobalSettings();
		expect(gs.isServerSideAuthEnabled()).toBe(false);
	});

	it('enables server-side auth', () => {
		const gs = createGlobalSettings();
		gs.enableServerSideAuth();
		expect(gs.isServerSideAuthEnabled()).toBe(true);
	});

	it('stores and retrieves runtime options', () => {
		// structuredClone may not be available in all test envs
		const origStructuredClone = globalThis.structuredClone;
		if (!globalThis.structuredClone) {
			globalThis.structuredClone = (val: any) =>
				JSON.parse(JSON.stringify(val));
		}
		const gs = createGlobalSettings();
		gs.setRuntimeOptions({ cookies: { sameSite: 'strict' } });
		expect(gs.getRuntimeOptions()).toEqual({ cookies: { sameSite: 'strict' } });
		globalThis.structuredClone = origStructuredClone;
	});

	it('stores and retrieves SSL origin', () => {
		const gs = createGlobalSettings();
		expect(gs.isSSLOrigin()).toBe(false);
		gs.setIsSSLOrigin(true);
		expect(gs.isSSLOrigin()).toBe(true);
	});
});
