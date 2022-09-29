/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { Dimensions, EventSubscription, ScaledSize } from 'react-native';
import { renderHook } from '@testing-library/react-hooks';
import useDeviceOrientation from '../useDeviceOrientation';

const landscapeDimensions = { height: 100, width: 300 } as ScaledSize;
const portraitDimensions = { height: 300, width: 100 } as ScaledSize;

describe('useDeviceOrientation', () => {
	const subscription: Pick<EventSubscription, 'remove'> = { remove: jest.fn() };

	let getSpy: jest.SpyInstance;
	let addEventListenerSpy: jest.SpyInstance;
	let removeEventListener: jest.SpyInstance;

	beforeEach(() => {
		jest.resetAllMocks();

		getSpy = jest.spyOn(Dimensions, 'get');

		addEventListenerSpy = jest.spyOn(Dimensions, 'addEventListener');
		removeEventListener = jest.spyOn(Dimensions, 'removeEventListener');
	});

	it('should handle unsubscribing for React Native versions < 0.65', () => {
		getSpy.mockImplementation((_: string) => portraitDimensions);

		const { unmount } = renderHook(() => useDeviceOrientation());

		expect(getSpy).toHaveBeenCalledTimes(1);
		expect(getSpy).toHaveBeenCalledWith('screen');
		expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

		unmount();

		expect(removeEventListener).toHaveBeenCalledTimes(1);
		expect(subscription.remove).not.toHaveBeenCalled();
	});

	it('should handle unsubscribing for React Native versions >= 0.65', () => {
		getSpy.mockImplementation((_: string) => landscapeDimensions);
		addEventListenerSpy.mockReturnValue(subscription);

		const { unmount } = renderHook(() => useDeviceOrientation());

		expect(getSpy).toHaveBeenCalledTimes(1);
		expect(getSpy).toHaveBeenCalledWith('screen');
		expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

		unmount();

		expect(subscription.remove).toHaveBeenCalledTimes(1);
		expect(removeEventListener).not.toHaveBeenCalled();
	});

	it.each([
		['landscape', landscapeDimensions, true, false],
		['portrait', portraitDimensions, false, true],
	])(
		'returns the expected values when the device is in %s mode',
		(deviceOrientation, dimensions, isLandscapeMode, isPortraitMode) => {
			getSpy.mockImplementation((_: string) => dimensions);

			const { result } = renderHook(() => useDeviceOrientation());

			expect(result.current.deviceOrientation).toBe(deviceOrientation);
			expect(result.current.isLandscapeMode).toBe(isLandscapeMode);
			expect(result.current.isPortraitMode).toBe(isPortraitMode);
		}
	);
});
