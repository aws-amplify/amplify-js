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
import useOrientation from '../useOrientation';

describe('useOrientation', () => {
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
		getSpy.mockImplementation((_: string) => ({ height: 300, width: 100 } as ScaledSize));

		const { result, unmount } = renderHook(() => useOrientation());

		expect(getSpy).toHaveBeenCalledTimes(1);
		expect(getSpy).toHaveBeenCalledWith('screen');
		expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

		expect(result.current).toBe('portrait');

		unmount();

		expect(removeEventListener).toHaveBeenCalledTimes(1);
		expect(subscription.remove).not.toHaveBeenCalled();
	});

	it('should handle unsubscribing for React Native versions >= 0.65', () => {
		getSpy.mockImplementation((_: string) => ({ height: 100, width: 300 } as ScaledSize));
		addEventListenerSpy.mockReturnValue(subscription);

		const { result, unmount } = renderHook(() => useOrientation());

		expect(getSpy).toHaveBeenCalledTimes(1);
		expect(getSpy).toHaveBeenCalledWith('screen');
		expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
		expect(result.current).toBe('landscape');

		unmount();

		expect(subscription.remove).toHaveBeenCalledTimes(1);
		expect(removeEventListener).not.toHaveBeenCalled();
	});
});
