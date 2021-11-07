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

import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import isNull from 'lodash/isNull';

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { InAppMessageImage, InAppMessageLayout } from '@aws-amplify/notifications';

import { ImageDimensions, UseMessageImage } from './types';
import { getLayoutImageDimensions, prefetchNetworkImage } from './utils';

const FAILURE_IMAGE_DIMENSIONS: ImageDimensions = { height: 0, width: 0 };

const logger = new Logger('Notifications.InAppMessaging');

/**
 * Handles prefetching and dimension setting for message images
 *
 * @param {image} object - contains image source
 * @param layout - message layout
 * @returns {UseMessageImage} message image dimensions and rendering related booleans
 */

export default function useMessageImage(image: InAppMessageImage, layout: InAppMessageLayout): UseMessageImage {
	const [imageDimensions, setImageDimensions] = useState<ImageDimensions>(null);
	const { src } = image ?? {};

	const hasSetDimensions = !isNull(imageDimensions);
	const hasImage = !!src;

	const hasRenderableImage = hasImage && hasSetDimensions;
	const isImageFetching = hasImage && !hasSetDimensions;

	useEffect(() => {
		if (hasImage) {
			prefetchNetworkImage(src).then((loadingState) => {
				if (loadingState === 'loaded') {
					// get image size once loaded
					Image.getSize(
						src,
						(width, height) => {
							setImageDimensions(getLayoutImageDimensions(height, width, layout));
						},
						(error) => {
							logger.error(`Unable to retrieve size for image: ${error}`);

							// set dimension values to 0 if size retrieval failure
							setImageDimensions(FAILURE_IMAGE_DIMENSIONS);
						}
					);
				} else {
					// set dimension values to 0 if prefetch failure
					setImageDimensions(FAILURE_IMAGE_DIMENSIONS);
				}
			});
		}
	}, [hasImage, layout, src]);

	return { hasRenderableImage, imageDimensions, isImageFetching };
}
