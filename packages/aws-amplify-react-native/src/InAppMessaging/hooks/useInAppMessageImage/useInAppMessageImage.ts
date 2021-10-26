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
import { ImageStyle, StyleSheet } from 'react-native';

import { InAppMessageImage, InAppMessageLayout } from '@aws-amplify/notifications';

import { BANNER_IMAGE_SCREEN_SIZE, CAROUSEL_IMAGE_SCREEN_SIZE, FULL_SCREEN_IMAGE_SCREEN_SIZE } from './constants';

import { ImageLoadingState } from './types';
import { prefetchNetworkImage } from './utils';

const inAppMessageImageSizes: Record<InAppMessageLayout, number> = {
	BOTTOM_BANNER: BANNER_IMAGE_SCREEN_SIZE,
	MIDDLE_BANNER: BANNER_IMAGE_SCREEN_SIZE,
	TOP_BANNER: BANNER_IMAGE_SCREEN_SIZE,
	CAROUSEL: CAROUSEL_IMAGE_SCREEN_SIZE,
	OVERLAYS: FULL_SCREEN_IMAGE_SCREEN_SIZE,
};

export default function useInAppMessageImage(
	{ src }: InAppMessageImage,
	layout: InAppMessageLayout
): { delayMessageRendering: boolean; imageStyle: ImageStyle; shouldRenderImage: boolean } {
	const hasImage = !!src;
	const [imageLoadingState, setImageLoadingState] = useState<ImageLoadingState>(hasImage ? 'loading' : null);

	useEffect(() => {
		if (hasImage) {
			prefetchNetworkImage(src).then((loadingState) => {
				setImageLoadingState(loadingState);
			});
		}
	}, [hasImage, src]);

	const hasFailed = imageLoadingState === 'failed';
	const isLoaded = imageLoadingState === 'loaded';
	const isLoading = imageLoadingState === 'loading';

	const delayMessageRendering = hasImage && isLoading;
	const shouldRenderImage = hasImage && !hasFailed && isLoaded;

	const { imageStyle } = useMemo(() => {
		if (shouldRenderImage) {
			const imageSize = inAppMessageImageSizes[layout];
			return StyleSheet.create({ imageStyle: { height: imageSize, width: imageSize, resizeMode: 'contain' } });
		}
		return null;
	}, [layout, shouldRenderImage]);

	return { delayMessageRendering, imageStyle, shouldRenderImage };
}
