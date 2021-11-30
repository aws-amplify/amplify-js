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
	const [prefetchStatus, setPrefetchStatus] = useState<ImagePrefetchStatus>(ImagePrefetchStatus.INITIAL);
	const imageDimensions = useRef<ImageDimensions>(INITIAL_IMAGE_DIMENSIONS).current;

	const { src } = image ?? {};
	const hasImage = !!src;

	const shouldPrefetch = hasImage && prefetchStatus === ImagePrefetchStatus.INITIAL;
	const isImageFetching = shouldPrefetch || prefetchStatus === ImagePrefetchStatus.FETCHING;
	const hasRenderableImage = hasImage && prefetchStatus === ImagePrefetchStatus.SUCCESS;

	useEffect(() => {
		if (shouldPrefetch) {
			prefetchNetworkImage(src).then((prefetchResult) => {
				if (prefetchResult === 'loaded') {
					setPrefetchStatus(ImagePrefetchStatus.FETCHING);

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
		}
	}, [imageDimensions, layout, shouldPrefetch, src]);

	return { hasRenderableImage, imageDimensions, isImageFetching };
}
