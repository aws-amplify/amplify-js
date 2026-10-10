// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { amplifyUuid } from '@aws-amplify/core/internals/utils';
import { loadAsyncStorage } from '@aws-amplify/react-native';

jest.mock('@aws-amplify/react-native', () => ({
	loadAsyncStorage: jest.fn(),
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	amplifyUuid: jest.fn(),
}));

const DEVICE_ID_STORAGE_KEY =
	'@aws-amplify/notifications/customer-profiles/deviceId';

describe('getDeviceId (customer-profiles)', () => {
	const mockLoadAsyncStorage = loadAsyncStorage as jest.Mock;
	const mockAmplifyUuid = amplifyUuid as jest.Mock;
	const mockGetItem = jest.fn();
	const mockSetItem = jest.fn();

	// The module memoizes its resolution at module scope, so every test needs a
	// fresh module registry to exercise the first-call path.
	const loadGetDeviceId = () => {
		let getDeviceId!: () => Promise<string>;
		jest.isolateModules(() => {
			({
				getDeviceId,
			} = require('../../../../../src/pushNotifications/providers/customer-profiles/utils/getDeviceId'));
		});

		return getDeviceId;
	};

	beforeEach(() => {
		mockLoadAsyncStorage.mockReturnValue({
			getItem: mockGetItem,
			setItem: mockSetItem,
		});
		mockGetItem.mockResolvedValue(null);
		mockSetItem.mockResolvedValue(undefined);
		mockAmplifyUuid.mockReturnValue('generated-device-id');
	});

	afterEach(() => {
		mockLoadAsyncStorage.mockReset();
		mockAmplifyUuid.mockReset();
		mockGetItem.mockReset();
		mockSetItem.mockReset();
	});

	it('returns the persisted device id without writing', async () => {
		mockGetItem.mockResolvedValue('persisted-device-id');
		const getDeviceId = loadGetDeviceId();

		await expect(getDeviceId()).resolves.toBe('persisted-device-id');
		expect(mockGetItem).toHaveBeenCalledWith(DEVICE_ID_STORAGE_KEY);
		expect(mockSetItem).not.toHaveBeenCalled();
	});

	it('generates and persists a device id when none is stored', async () => {
		const getDeviceId = loadGetDeviceId();

		await expect(getDeviceId()).resolves.toBe('generated-device-id');
		expect(mockSetItem).toHaveBeenCalledWith(
			DEVICE_ID_STORAGE_KEY,
			'generated-device-id',
		);
	});

	it('reuses the resolved id on subsequent calls without re-reading storage', async () => {
		const getDeviceId = loadGetDeviceId();

		const first = await getDeviceId();
		const second = await getDeviceId();

		expect(second).toBe(first);
		expect(mockGetItem).toHaveBeenCalledTimes(1);
		expect(mockSetItem).toHaveBeenCalledTimes(1);
	});

	it('dedupes CONCURRENT first-calls into a single resolution (one uuid, one write)', async () => {
		// Storage is async, so without an in-flight promise each concurrent caller
		// would read `null`, mint its own uuid and write it — producing divergent
		// device ids for the same install.
		let releaseGetItem!: (value: string | null) => void;
		mockGetItem.mockImplementation(
			() =>
				new Promise<string | null>(resolve => {
					releaseGetItem = resolve;
				}),
		);
		mockAmplifyUuid
			.mockReturnValueOnce('uuid-1')
			.mockReturnValueOnce('uuid-2')
			.mockReturnValueOnce('uuid-3')
			.mockReturnValueOnce('uuid-4')
			.mockReturnValueOnce('uuid-5');
		const getDeviceId = loadGetDeviceId();

		const pending = [
			getDeviceId(),
			getDeviceId(),
			getDeviceId(),
			getDeviceId(),
			getDeviceId(),
		];
		releaseGetItem(null);
		const results = await Promise.all(pending);

		expect(new Set(results).size).toBe(1);
		expect(results).toEqual(['uuid-1', 'uuid-1', 'uuid-1', 'uuid-1', 'uuid-1']);
		expect(mockGetItem).toHaveBeenCalledTimes(1);
		expect(mockSetItem).toHaveBeenCalledTimes(1);
		expect(mockAmplifyUuid).toHaveBeenCalledTimes(1);
	});

	it('shares one resolution across concurrent calls when a value is already persisted', async () => {
		mockGetItem.mockResolvedValue('persisted-device-id');
		const getDeviceId = loadGetDeviceId();

		const results = await Promise.all([
			getDeviceId(),
			getDeviceId(),
			getDeviceId(),
		]);

		expect(results).toEqual([
			'persisted-device-id',
			'persisted-device-id',
			'persisted-device-id',
		]);
		expect(mockGetItem).toHaveBeenCalledTimes(1);
		expect(mockSetItem).not.toHaveBeenCalled();
	});

	it('does NOT cache a rejected resolution — a later call retries', async () => {
		mockGetItem.mockRejectedValueOnce(new Error('storage unavailable'));
		mockGetItem.mockResolvedValueOnce('persisted-device-id');
		const getDeviceId = loadGetDeviceId();

		await expect(getDeviceId()).rejects.toThrow('storage unavailable');
		await expect(getDeviceId()).resolves.toBe('persisted-device-id');
		expect(mockGetItem).toHaveBeenCalledTimes(2);
	});

	it('rejects every concurrent caller when the shared resolution fails, then recovers', async () => {
		mockGetItem.mockRejectedValueOnce(new Error('storage unavailable'));
		mockGetItem.mockResolvedValueOnce('persisted-device-id');
		const getDeviceId = loadGetDeviceId();

		const results = await Promise.allSettled([getDeviceId(), getDeviceId()]);
		expect(results.every(({ status }) => status === 'rejected')).toBe(true);

		await expect(getDeviceId()).resolves.toBe('persisted-device-id');
	});
});
