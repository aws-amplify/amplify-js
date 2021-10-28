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

import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import isEmpty from 'lodash/isEmpty';

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { InAppMessageImage, InAppMessageLayout } from '@aws-amplify/notifications';

import { BANNER_IMAGE_SCREEN_SIZE, CAROUSEL_IMAGE_SCREEN_SIZE, FULL_SCREEN_IMAGE_SCREEN_SIZE } from './constants';

import { ImageDimensions, UseInAppMessageImage } from './types';
import { prefetchNetworkImage } from './utils';

const logger = new Logger('Notifications.InAppMessaging');

const inAppMessageImageSizes: Record<InAppMessageLayout, number> = {
	BOTTOM_BANNER: BANNER_IMAGE_SCREEN_SIZE,
	MIDDLE_BANNER: BANNER_IMAGE_SCREEN_SIZE,
	TOP_BANNER: BANNER_IMAGE_SCREEN_SIZE,
	CAROUSEL: CAROUSEL_IMAGE_SCREEN_SIZE,
	OVERLAYS: FULL_SCREEN_IMAGE_SCREEN_SIZE,
};

export default function useInAppMessageImage(
	image: InAppMessageImage,
	layout: InAppMessageLayout
): UseInAppMessageImage {
	const [imageDimensions, setImageDimensions] = useState<ImageDimensions>(null);
	const { src } = image ?? {};

	const hasSetDimensions = !isEmpty(imageDimensions);
	const hasImage = !!src;

	const shouldDelayMessageRendering = hasImage && !hasSetDimensions;
	const shouldRenderImage = hasImage && hasSetDimensions;

	useEffect(() => {
		if (hasImage) {
			prefetchNetworkImage(src).then((loadingState) => {
				// get image size once loaded
				if (loadingState === 'loaded') {
					Image.getSize(
						src,
						(width, height) => {
							// determine aspect ratio for scaling rendered image
							const aspectRatio = width / height;
							setImageDimensions({ aspectRatio, height, width });
						},
						(error) => {
							logger.error(`Unable to retrieve size for image: ${error}`);

							// set dimension values to 0 if size retrieval failure
							setImageDimensions({ aspectRatio: 0, height: 0, width: 0 });
						}
					);
				}

				// set dimension values to 0 if prefetch failure
				setImageDimensions({ aspectRatio: 0, height: 0, width: 0 });
			});
		}
	}, [hasImage, src]);

	const { imageStyle } = useMemo(() => {
		if (shouldRenderImage) {
			const { aspectRatio, height: imageHeight, width: imageWidth } = imageDimensions;

			const isSquare = aspectRatio === 1;
			const isPortrait = imageHeight > imageWidth;
			const isLandcape = imageWidth < imageHeight;

			const maxImageDimension = inAppMessageImageSizes[layout];
			const minImageDimension = maxImageDimension / aspectRatio;

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
				width = minImageDimension;
			}

			// set landscape image dimensions
			if (isLandcape) {
				height = minImageDimension;
				width = maxImageDimension;
			}

			return StyleSheet.create({ imageStyle: { height, resizeMode: 'contain', width } });
		}
		return { imageStyle: null };
	}, [imageDimensions, layout, shouldRenderImage]);

	return { imageStyle, shouldDelayMessageRendering, shouldRenderImage };
}
