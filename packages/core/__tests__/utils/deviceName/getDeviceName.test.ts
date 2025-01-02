// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { getDeviceName } from '../../../src/utils/deviceName';

describe('getDeviceName()', () => {
	const userAgentData = {
		platform: 'device-platform',
		platformVersion: 'device-platform-version',
		architecture: 'device-architecture',
		model: 'device-model',
		fullVersionList: [
			{ brand: 'device-brand-1', version: 'device-version-1' },
			{ brand: 'device-brand-2', version: 'device-version-2' },
		],
	};
	const userAgent = `product/version`;

	const mockGetHighEntropyValues = jest.fn();
	const navigatorSpy = jest.spyOn(window, 'navigator', 'get');

	afterEach(() => {
		mockGetHighEntropyValues.mockReset();
		navigatorSpy.mockReset();
	});

	it('should return a device name based on user agent data', async () => {
		mockGetHighEntropyValues.mockResolvedValue(userAgentData);
		navigatorSpy.mockReturnValue({
			userAgentData: {
				getHighEntropyValues: mockGetHighEntropyValues,
			},
		} as any);

		const { architecture, fullVersionList, model, platform, platformVersion } =
			userAgentData;
		const [brand1, brand2] = fullVersionList;
		expect(await getDeviceName()).toBe(
			`${platform} ` +
				`${platformVersion} ` +
				`${architecture} ` +
				`${model} ` +
				`${platform} ` +
				`${brand1.brand}/${brand1.version};` +
				`${brand2.brand}/${brand2.version}`,
		);
	});

	it('should fall back to user agent if no user agent data', async () => {
		navigatorSpy.mockReturnValue({ userAgent } as any);

		expect(await getDeviceName()).toBe(userAgent);
	});

	it('should fall back to user agent if deviceName resolves to empty string', async () => {
		// simulated devices in Chrome can return empty strings
		mockGetHighEntropyValues.mockResolvedValue({
			platform: '',
			platformVersion: '',
			architecture: '',
			model: '',
			fullVersionList: [],
		});
		navigatorSpy.mockReturnValue({
			userAgentData: {
				getHighEntropyValues: mockGetHighEntropyValues,
			},
			userAgent,
		} as any);

		expect(await getDeviceName()).toBe(userAgent);
	});
});
