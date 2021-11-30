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
import { ConsoleLogger as Logger } from '@aws-amplify/core';

import { BANNER_IMAGE_SCREEN_MULTIPLIER, BANNER_IMAGE_SCREEN_SIZE } from '../constants';
import { getLayoutImageDimensions, prefetchNetworkImage } from '../utils';

jest.mock('react-native', () => ({
	Dimensions: { get: jest.fn(() => ({ height: 844, width: 400 })) },
	Image: { prefetch: jest.fn() },
}));

const logger = new Logger('TEST_LOGGER');

const url = 'https://test.jpeg';

describe('prefetchNetworkImage', () => {
	beforeEach(() => {
		(logger.error as jest.Mock).mockClear();
	});

	it('behaves as expected in the happy path', async () => {
		(Image.prefetch as jest.Mock).mockResolvedValueOnce(true);

		const output = await prefetchNetworkImage(url);

		expect(output).toBe('loaded');
	});

	it('handles a false response from Imaage.prefetch as expected', async () => {
		(Image.prefetch as jest.Mock).mockResolvedValueOnce(false);

		const output = await prefetchNetworkImage(url);

		expect(logger.error).toHaveBeenLastCalledWith(`Image failed to load: ${url}`);
		expect(logger.error).toHaveBeenCalledTimes(1);

		expect(output).toBe('failed');
	});

	it('handles an error from Imaage.prefetch as expected', async () => {
		const error = 'ERROR';
		(Image.prefetch as jest.Mock).mockRejectedValueOnce(new Error(error));

		const output = await prefetchNetworkImage(url);

		expect(logger.error).toHaveBeenLastCalledWith(`Image.prefetch failed: Error: ${error}`);
		expect(logger.error).toHaveBeenCalledTimes(1);

		expect(output).toBe('failed');
	});
});

describe('getLayoutImageDimensions', () => {
	it('returns the expected values for a square image', () => {
		const imageHeight = 100;
		const imageWidth = 100;

		const output = getLayoutImageDimensions(imageHeight, imageWidth, 'TOP_BANNER');

		expect(output).toStrictEqual({
			height: BANNER_IMAGE_SCREEN_SIZE,
			width: BANNER_IMAGE_SCREEN_SIZE,
		});
	});

	it('returns the expected values for a portrait image', () => {
		const imageHeight = 200;
		const imageWidth = 100;

		const output = getLayoutImageDimensions(imageHeight, imageWidth, 'TOP_BANNER');

		expect(output).toStrictEqual({
			height: BANNER_IMAGE_SCREEN_SIZE,
			width: imageHeight * BANNER_IMAGE_SCREEN_MULTIPLIER,
		});
	});

	it('returns the expected values for a landscape image', () => {
		const imageHeight = 100;
		const imageWidth = 200;

		const output = getLayoutImageDimensions(imageHeight, imageWidth, 'TOP_BANNER');

		expect(output).toStrictEqual({
			height: imageWidth * BANNER_IMAGE_SCREEN_MULTIPLIER,
			width: BANNER_IMAGE_SCREEN_SIZE,
		});
	});
});
