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

import { Image } from 'react-native';
import { renderHook } from '@testing-library/react-hooks';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { InAppMessageImage } from '@aws-amplify/notifications';

import { FAILURE_IMAGE_DIMENSIONS } from '../constants';
import { getLayoutImageDimensions, prefetchNetworkImage } from '../utils';
import useMessageImage from '../useMessageImage';

jest.mock('react-native', () => ({
	Dimensions: { get: jest.fn(() => ({ height: 844, width: 400 })) },
	Image: { getSize: jest.fn() },
}));

jest.mock('../utils');

const logger = new Logger('TEST_LOGGER');

const src = 'https://test.jpeg';
const image = { src };

describe('useMessageImage', () => {
	beforeEach(() => {
		(logger.error as jest.Mock).mockClear();
	});

	it('behaves as expected in the happy path', async () => {
		const imageDimensions = { height: 100, width: 100 };
		(prefetchNetworkImage as jest.Mock).mockResolvedValue('loaded');
		(getLayoutImageDimensions as jest.Mock).mockReturnValueOnce(imageDimensions);
		(Image.getSize as jest.Mock).mockImplementationOnce((_, onSuccess: () => void) => {
			onSuccess();
		});

		const { result, waitForNextUpdate } = renderHook(() => useMessageImage(image, 'TOP_BANNER'));

		// first render
		expect(result.current).toEqual({
			hasRenderableImage: false,
			imageDimensions: null,
			isImageFetching: true,
		});

		await waitForNextUpdate();

		expect(result.current).toEqual({
			hasRenderableImage: true,
			imageDimensions,
			isImageFetching: false,
		});
	});

	it('handles size retrieval errors as expected', async () => {
		const error = 'ERROR';

		(prefetchNetworkImage as jest.Mock).mockResolvedValue('loaded');
		(Image.getSize as jest.Mock).mockImplementationOnce((_, __, onError: (error) => void) => {
			onError(error);
		});

		const { result, waitForNextUpdate } = renderHook(() => useMessageImage(image, 'TOP_BANNER'));

		// first render
		expect(result.current).toEqual({
			hasRenderableImage: false,
			imageDimensions: null,
			isImageFetching: true,
		});

		await waitForNextUpdate();

		expect(logger.error).toHaveBeenCalledWith(`Unable to retrieve size for image: ${error}`);
		expect(logger.error).toHaveBeenCalledTimes(1);

		expect(result.current).toEqual({
			hasRenderableImage: false,
			imageDimensions: FAILURE_IMAGE_DIMENSIONS,
			isImageFetching: false,
		});
	});

	it('handles prefetching errors as expected', async () => {
		(prefetchNetworkImage as jest.Mock).mockResolvedValue('failed');

		const { result, waitForNextUpdate } = renderHook(() => useMessageImage(image, 'TOP_BANNER'));

		// first render
		expect(result.current).toEqual({
			hasRenderableImage: false,
			imageDimensions: null,
			isImageFetching: true,
		});

		await waitForNextUpdate();

		expect(logger.error).not.toHaveBeenCalled();

		expect(result.current).toEqual({
			hasRenderableImage: false,
			imageDimensions: FAILURE_IMAGE_DIMENSIONS,
			isImageFetching: false,
		});
	});

	it('returns the expected values when the image argument is an empty object', () => {
		const { result } = renderHook(() => useMessageImage({} as InAppMessageImage, 'TOP_BANNER'));

		expect(result.current).toEqual({
			hasRenderableImage: false,
			imageDimensions: null,
			isImageFetching: false,
		});
	});

	it('returns the expected values when the image argument is null', () => {
		const { result } = renderHook(() => useMessageImage(null, 'TOP_BANNER'));

		expect(result.current).toEqual({
			hasRenderableImage: false,
			imageDimensions: null,
			isImageFetching: false,
		});
	});
});
