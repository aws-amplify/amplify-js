// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHmac } from 'crypto';

const mockPlatform: Record<string, any> = {};
const mockGetDeviceName = jest.fn();
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('react-native', () => ({
	Platform: mockPlatform,
	Dimensions: {
		get: () => ({ width: 390, height: 844, scale: 3 }),
	},
}));
jest.mock('@aws-amplify/react-native', () => ({
	getDeviceName: () => mockGetDeviceName(),
}));
jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	defaultStorage: {
		getItem: (...args: any[]) => mockGetItem(...args),
		setItem: (...args: any[]) => mockSetItem(...args),
	},
}));
jest.mock('../../../../src/providers/cognito/utils/textEncoder', () => ({
	textEncoder: {
		convert: (input: string) => new Uint8Array(Buffer.from(input, 'utf8')),
	},
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	amplifyUuid: () => 'generated-device-id',
}));

const params = {
	username: 'user',
	userPoolId: 'us-east-1_pool',
	userPoolClientId: 'client-id',
};

const loadGetUserContextData = () => {
	let getUserContextData: any;
	jest.isolateModules(() => {
		({
			getUserContextData,
		} = require('../../../../src/providers/cognito/utils/userContextData.native'));
	});

	return getUserContextData;
};

const decode = (encodedData: string) => {
	const result = JSON.parse(Buffer.from(encodedData, 'base64').toString());

	return { ...result, payload: JSON.parse(result.payload), raw: result };
};

describe('getUserContextData (React Native)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Object.keys(mockPlatform).forEach(key => delete mockPlatform[key]);
		(global as any).__DEV__ = false;
		mockGetItem.mockResolvedValue(null);
		mockSetItem.mockResolvedValue(undefined);
		mockGetDeviceName.mockResolvedValue('Test’s iPhone');
		jest.spyOn(Date, 'now').mockReturnValue(1790000000123);
		jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(420);
		jest.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
			resolvedOptions: () => ({ locale: 'en-GB' }),
		} as Intl.DateTimeFormat);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('returns signed iOS context data', async () => {
		Object.assign(mockPlatform, { OS: 'ios', Version: '18.0', isPad: false });

		const result = await loadGetUserContextData()(params);
		const { version, signature, payload, raw } = decode(result.EncodedData);

		expect(version).toBe('IOS20171114');
		expect(signature).toBe(
			createHmac('sha256', params.userPoolClientId)
				.update(`${version}${raw.payload}`)
				.digest('base64'),
		);
		expect(payload).toEqual({
			username: params.username,
			userPoolId: params.userPoolId,
			timestamp: '1790000000123',
			contextData: expect.objectContaining({
				Platform: 'iOS',
				DeviceId: 'generated-device-id',
				DeviceName: 'Test’s iPhone',
				DeviceOsReleaseVersion: '18.0',
				PhoneType: 'iPhone',
				BuildType: 'release',
				DeviceFingerprint: 'Apple/iPhone/-/-:18.0/-/-:-/release',
				ScreenHeightPixels: '844',
				ScreenWidthPixels: '390',
				ClientTimezone: '-07:00',
				DeviceLanguage: 'en-GB',
			}),
		});
	});

	it('returns signed Android context data', async () => {
		Object.assign(mockPlatform, {
			OS: 'android',
			Version: 34,
			constants: {
				Brand: 'google',
				Fingerprint: 'google/panther/panther:14/release-keys',
				Manufacturer: 'Google',
				Model: 'Pixel 7',
				Release: '14',
			},
		});

		const result = await loadGetUserContextData()(params);
		const { version, signature, payload, raw } = decode(result.EncodedData);

		expect(version).toBe('ANDROID20171114');
		expect(signature).toBe(
			createHmac('sha256', params.userPoolClientId)
				.update(`${version}${raw.payload}`)
				.digest('base64'),
		);
		expect(payload.contextData).toEqual(
			expect.objectContaining({
				Platform: 'ANDROID',
				DeviceId: 'generated-device-id',
				DeviceBrand: 'google',
				DeviceFingerprint: 'google/panther/panther:14/release-keys',
				DeviceManufacturer: 'Google',
				DeviceName: 'Pixel 7',
				DeviceOsReleaseVersion: '14',
				DeviceSdkVersion: '34',
				ScreenHeightPixels: '2532',
				ScreenWidthPixels: '1170',
			}),
		);
		expect(mockGetDeviceName).not.toHaveBeenCalled();
	});

	it('persists a generated device id and reuses it', async () => {
		Object.assign(mockPlatform, { OS: 'ios', Version: '18.0' });
		const getUserContextData = loadGetUserContextData();

		await getUserContextData(params);
		const second = await getUserContextData(params);

		expect(mockGetItem).toHaveBeenCalledTimes(1);
		expect(mockSetItem).toHaveBeenCalledWith(
			'amplify-cognito-asf-device-id',
			'generated-device-id',
		);
		expect(decode(second.EncodedData).payload.contextData.DeviceId).toBe(
			'generated-device-id',
		);
	});

	it('uses a previously stored device id', async () => {
		Object.assign(mockPlatform, { OS: 'ios', Version: '18.0' });
		mockGetItem.mockResolvedValue('stored-device-id');

		const result = await loadGetUserContextData()(params);

		expect(mockSetItem).not.toHaveBeenCalled();
		expect(decode(result.EncodedData).payload.contextData.DeviceId).toBe(
			'stored-device-id',
		);
	});

	it('omits the device name when it cannot be resolved', async () => {
		Object.assign(mockPlatform, { OS: 'ios', Version: '18.0' });
		mockGetDeviceName.mockRejectedValue(new Error('not linked'));

		const result = await loadGetUserContextData()(params);

		expect(decode(result.EncodedData).payload.contextData).not.toHaveProperty(
			'DeviceName',
		);
	});

	it('reports an iPad', async () => {
		Object.assign(mockPlatform, { OS: 'ios', Version: '18.0', isPad: true });

		const result = await loadGetUserContextData()(params);

		expect(decode(result.EncodedData).payload.contextData).toEqual(
			expect.objectContaining({
				PhoneType: 'iPad',
				DeviceFingerprint: 'Apple/iPad/-/-:18.0/-/-:-/release',
			}),
		);
	});

	it.each([
		[420, '-07:00'],
		[-330, '+05:30'],
		[0, '+00:00'],
		[570, '-09:30'],
	])(
		'formats a timezone offset of %i minutes as %s',
		async (offset, expected) => {
			Object.assign(mockPlatform, { OS: 'ios', Version: '18.0' });
			(Date.prototype.getTimezoneOffset as jest.Mock).mockReturnValue(offset);

			const result = await loadGetUserContextData()(params);

			expect(
				decode(result.EncodedData).payload.contextData.ClientTimezone,
			).toBe(expected);
		},
	);

	it('omits the device name when the native module is not linked', async () => {
		Object.assign(mockPlatform, { OS: 'ios', Version: '18.0' });
		mockGetDeviceName.mockImplementation(() => {
			throw new Error('not linked');
		});

		const result = await loadGetUserContextData()(params);
		const { contextData } = decode(result.EncodedData).payload;

		expect(contextData).not.toHaveProperty('DeviceName');
		expect(contextData.DeviceId).toBe('generated-device-id');
	});

	it('retries loading the device id after a storage failure', async () => {
		Object.assign(mockPlatform, { OS: 'ios', Version: '18.0' });
		mockGetItem.mockRejectedValueOnce(new Error('storage unavailable'));
		const getUserContextData = loadGetUserContextData();

		expect(await getUserContextData(params)).toBeUndefined();
		const result = await getUserContextData(params);

		expect(decode(result.EncodedData).payload.contextData.DeviceId).toBe(
			'generated-device-id',
		);
	});

	it('returns undefined when storage fails', async () => {
		Object.assign(mockPlatform, { OS: 'ios', Version: '18.0' });
		mockGetItem.mockRejectedValue(new Error('storage unavailable'));

		expect(await loadGetUserContextData()(params)).toBeUndefined();
	});

	it('returns undefined on unsupported platforms', async () => {
		Object.assign(mockPlatform, { OS: 'windows' });

		expect(await loadGetUserContextData()(params)).toBeUndefined();
		expect(mockGetItem).not.toHaveBeenCalled();
	});
});
