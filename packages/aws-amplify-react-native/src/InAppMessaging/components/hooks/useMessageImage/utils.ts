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
import { InAppMessageLayout } from '@aws-amplify/notifications';

import { BANNER_IMAGE_SCREEN_SIZE, CAROUSEL_IMAGE_SCREEN_SIZE, FULL_SCREEN_IMAGE_SCREEN_SIZE } from './constants';
import { ImageDimensions, ImageLoadingState } from './types';

const logger = new Logger('Notifications.InAppMessaging');

const inAppMessageImageSizes: Record<InAppMessageLayout, number> = {
	BOTTOM_BANNER: BANNER_IMAGE_SCREEN_SIZE,
	MIDDLE_BANNER: BANNER_IMAGE_SCREEN_SIZE,
	TOP_BANNER: BANNER_IMAGE_SCREEN_SIZE,
	CAROUSEL: CAROUSEL_IMAGE_SCREEN_SIZE,
	OVERLAYS: FULL_SCREEN_IMAGE_SCREEN_SIZE,
};

export const prefetchNetworkImage = async (url: string): Promise<ImageLoadingState> => {
	try {
		const loaded = await Image.prefetch(url);
		if (loaded) {
			return 'loaded';
		}

		logger.error(`Image failed to load: ${url}`);
		return 'failed';
	} catch (e) {
		logger.error(`Image.prefetch failed: ${url}`);
		return 'failed';
	}
};

export const getImageDimensions = (
	imageHeight: number,
	imageWidth: number,
	layout: InAppMessageLayout
): ImageDimensions => {
	// determine aspect ratio for scaling rendered image
	const aspectRatio = imageWidth / imageHeight;
	const isSquare = aspectRatio === 1;
	const isPortrait = imageHeight > imageWidth;
	const isLandscape = imageWidth > imageHeight;

	// an image that has smaller dimensions than the max image dimension (e.g. 10px x 10px)
	// will be scaled up in size to match the size the message component expects.
	// While this could lead to pixelated images, it was ultimately a product decision,
	// ideally the message creator would follow the image guidelines in the pinpoint console
	const maxImageDimension = inAppMessageImageSizes[layout];

	let height: number;
	let width: number;

	// set square image dimensions
	if (isSquare) {
		height = maxImageDimension;
		width = maxImageDimension;
	}

	// set portrait image dimensions
	if (isPortrait) {
		height = maxImageDimension;
		width = maxImageDimension * aspectRatio;
	}

	// set landscape image dimensions
	if (isLandscape) {
		height = maxImageDimension / aspectRatio;
		width = maxImageDimension;
	}

	return { height, width };
};
