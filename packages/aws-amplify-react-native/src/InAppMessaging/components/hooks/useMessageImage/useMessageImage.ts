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

import { useEffect, useRef, useState } from 'react';
import { Image } from 'react-native';

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { InAppMessageImage, InAppMessageLayout } from '@aws-amplify/notifications';

import { INITIAL_IMAGE_DIMENSIONS } from './constants';
import { ImageDimensions, ImagePrefetchStatus, UseMessageImage } from './types';
import { getLayoutImageDimensions, prefetchNetworkImage } from './utils';

const logger = new Logger('Notifications.InAppMessaging');

/**
 * Handles prefetching and dimension setting for message images
 *
 * @param {image} object - contains image source
 * @param layout - message layout
 * @returns {UseMessageImage} message image dimensions and rendering related booleans
 */

export default function useMessageImage(image: InAppMessageImage, layout: InAppMessageLayout): UseMessageImage {
	const { src } = image ?? {};
	const shouldPrefetch = !!src;

	// set initial status to fetching if prefetch is required
	const [prefetchStatus, setPrefetchStatus] = useState<ImagePrefetchStatus>(
		shouldPrefetch ? ImagePrefetchStatus.FETCHING : null
	);
	const imageDimensions = useRef<ImageDimensions>(INITIAL_IMAGE_DIMENSIONS).current;

	const isImageFetching = prefetchStatus === ImagePrefetchStatus.FETCHING;
	const hasRenderableImage = prefetchStatus === ImagePrefetchStatus.SUCCESS;

	useEffect(() => {
		if (!shouldPrefetch) {
			return;
		}

		prefetchNetworkImage(src).then((prefetchResult) => {
			if (prefetchResult === 'loaded') {
				// get image size once loaded
				Image.getSize(
					src,
					(imageWidth, imageHeight) => {
						const { height, width } = getLayoutImageDimensions(imageHeight, imageWidth, layout);
						imageDimensions.height = height;
						imageDimensions.width = width;

						setPrefetchStatus(ImagePrefetchStatus.SUCCESS);
					},
					(error) => {
						// handle size retrieval error
						logger.error(`Unable to retrieve size for image: ${error}`);
						setPrefetchStatus(ImagePrefetchStatus.FAILURE);
					}
				);
			} else {
				// handle prefetch failure
				setPrefetchStatus(ImagePrefetchStatus.FAILURE);
			}
		});
	}, [imageDimensions, layout, shouldPrefetch, src]);

	return { hasRenderableImage, imageDimensions, isImageFetching };
}
