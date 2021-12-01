/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { renderHook } from '@testing-library/react-hooks';

import { InAppMessageComponentBaseProps, InAppMessageComponentButtonProps } from '../../../types';
import useMessageImage from '../../useMessageImage';

import useMessageProps from '../useMessageProps';
import { InAppMessageComponentStyle } from '../../..';

jest.mock('../../useMessageImage', () => ({
	__esModule: true,
	default: jest.fn(),
}));

const mockUseMessageImage = useMessageImage as jest.Mock;

const onDisplay = jest.fn();
const getDefaultStyle = jest.fn();

describe('useMessageProps', () => {
	beforeEach(() => {
		mockUseMessageImage.mockReturnValue({ hasRenderableImage: false, imageDimensions: null, isImageFetching: false });
		onDisplay.mockClear();
	});

	it('behaves as expected in the happy path', () => {
		const props: InAppMessageComponentBaseProps = { layout: 'MIDDLE_BANNER', onDisplay };

		const { result } = renderHook(() => useMessageProps(props, getDefaultStyle));

		expect(onDisplay).toHaveBeenCalledTimes(1);
		expect(result.current).toEqual({
			hasButtons: false,
			hasPrimaryButton: false,
			hasRenderableImage: false,
			hasSecondaryButton: false,
			shouldRenderMessage: true,
			styles: expect.any(Object) as InAppMessageComponentStyle,
		});
	});

	it('behaves as expected when props includes an image', () => {
		mockUseMessageImage.mockReturnValue({ hasRenderableImage: false, imageDimensions: null, isImageFetching: true });

		const props: InAppMessageComponentBaseProps = {
			image: { src: 'https://test.png' },
			layout: 'MIDDLE_BANNER',
			onDisplay,
		};

		const { result, rerender } = renderHook(() => useMessageProps(props, getDefaultStyle));

		// first render
		expect(onDisplay).not.toHaveBeenCalled();
		expect(result.current).toEqual({
			hasButtons: false,
			hasPrimaryButton: false,
			hasRenderableImage: false,
			hasSecondaryButton: false,
			shouldRenderMessage: false,
			styles: null,
		});

		mockUseMessageImage.mockReturnValue({
			hasRenderableImage: true,
			imageDimensions: { height: 12, width: 12 },
			isImageFetching: false,
		});

		rerender();

		expect(onDisplay).toHaveBeenCalledTimes(1);
		expect(result.current).toEqual({
			hasButtons: false,
			hasPrimaryButton: false,
			hasRenderableImage: true,
			hasSecondaryButton: false,
			shouldRenderMessage: true,
			styles: expect.any(Object) as InAppMessageComponentStyle,
		});
	});

	it('returns the expected values when props includes buttons', () => {
		const props: InAppMessageComponentBaseProps = {
			layout: 'MIDDLE_BANNER',

			primaryButton: { title: 'primary', onPress: jest.fn() },
			secondaryButton: { title: 'secondary', onPress: jest.fn() },
		};

		const { result } = renderHook(() => useMessageProps(props, getDefaultStyle));

		expect(result.current.hasButtons).toBe(true);
		expect(result.current.hasPrimaryButton).toBe(true);
		expect(result.current.hasSecondaryButton).toBe(true);
	});

	it('returns the expected values when props includes empty buttons', () => {
		const props: InAppMessageComponentBaseProps = {
			layout: 'MIDDLE_BANNER',

			primaryButton: {} as InAppMessageComponentButtonProps,
			secondaryButton: {} as InAppMessageComponentButtonProps,
		};

		const { result } = renderHook(() => useMessageProps(props, getDefaultStyle));

		expect(result.current.hasButtons).toBe(false);
		expect(result.current.hasPrimaryButton).toBe(false);
		expect(result.current.hasSecondaryButton).toBe(false);
	});

	it('returns the expected values when props includes only a primary button', () => {
		const props: InAppMessageComponentBaseProps = {
			layout: 'MIDDLE_BANNER',
			primaryButton: { title: 'primary', onPress: jest.fn() },
		};

		const { result } = renderHook(() => useMessageProps(props, getDefaultStyle));

		expect(result.current.hasButtons).toBe(true);
		expect(result.current.hasPrimaryButton).toBe(true);
		expect(result.current.hasSecondaryButton).toBe(false);
	});

	it('returns the expected values when props includes only a secondary button', () => {
		const props: InAppMessageComponentBaseProps = {
			layout: 'MIDDLE_BANNER',
			secondaryButton: { title: 'primary', onPress: jest.fn() },
		};

		const { result } = renderHook(() => useMessageProps(props, getDefaultStyle));

		expect(result.current.hasButtons).toBe(true);
		expect(result.current.hasPrimaryButton).toBe(false);
		expect(result.current.hasSecondaryButton).toBe(true);
	});
});
