// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getInflightDeviceRegistration,
	rejectInflightDeviceRegistration,
	resolveInflightDeviceRegistration,
} from '../../../../../src/pushNotifications/providers/pinpoint/utils/inflightDeviceRegistration';
import { InflightDeviceRegistration } from '../../../../../src/pushNotifications/providers/pinpoint/types';

describe('inflightDeviceRegistration', () => {
	describe('resolveInflightDeviceRegistration', () => {
		let getInflightDeviceRegistration: () => InflightDeviceRegistration;
		let resolveInflightDeviceRegistration: () => void;
		jest.isolateModules(() => {
			({
				getInflightDeviceRegistration,
				resolveInflightDeviceRegistration,
			} = require('../../../../../src/pushNotifications/providers/pinpoint/utils/inflightDeviceRegistration'));
		});

		it('creates a pending promise on module load', () => {
			expect(getInflightDeviceRegistration()).toBeDefined();
		});

		it('should resolve the promise', async () => {
			const blockedFunction = jest.fn();
			const promise = getInflightDeviceRegistration()?.then(() => {
				blockedFunction();
			});

			expect(blockedFunction).not.toHaveBeenCalled();
			resolveInflightDeviceRegistration();
			await promise;
			expect(blockedFunction).toHaveBeenCalled();
		});

		it('should have released the promise from memory', () => {
			expect(getInflightDeviceRegistration()).toBeUndefined();
		});
	});

	describe('rejectInflightDeviceRegistration', () => {
		let getInflightDeviceRegistration: () => InflightDeviceRegistration;
		let rejectInflightDeviceRegistration: (underlyingError: unknown) => void;
		jest.isolateModules(() => {
			({
				getInflightDeviceRegistration,
				rejectInflightDeviceRegistration,
			} = require('../../../../../src/pushNotifications/providers/pinpoint/utils/inflightDeviceRegistration'));
		});

		it('creates a pending promise on module load', () => {
			expect(getInflightDeviceRegistration()).toBeDefined();
		});

		it('should reject the promise', async () => {
			const underlyingError = new Error('underlying-error');
			const blockedFunction = jest.fn();
			const promise = getInflightDeviceRegistration()?.then(() => {
				blockedFunction();
			});

			expect(blockedFunction).not.toHaveBeenCalled();
			rejectInflightDeviceRegistration(underlyingError);
			await expect(promise).rejects.toMatchObject({
				name: 'DeviceRegistrationFailed',
				underlyingError,
			});
			expect(blockedFunction).not.toHaveBeenCalled();
		});
	});
});
