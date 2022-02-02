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

import { Dimensions } from 'react-native';
import { ImageDimensions } from './types';

// as images are not expected to be responsive to orientation changes get screen dimensions at app start
const SCREEN_DIMENSIONS = Dimensions.get('screen');

// compare screen width and height and assign the lesser of the two as the base screen dimension
const BASE_SCREEN_DIMENSION =
	SCREEN_DIMENSIONS.width < SCREEN_DIMENSIONS.height ? SCREEN_DIMENSIONS.width : SCREEN_DIMENSIONS.height;

// base size that message images should fill
// - all banner message images should fill 20 percent of the base screen dimension
// - all other components should fill 60 percent of the base screen dimension
export const BANNER_IMAGE_SCREEN_MULTIPLIER = 0.2;
export const CAROUSEL_IMAGE_SCREEN_MULTIPLIER = 0.6;
export const FULL_SCREEN_IMAGE_SCREEN_MULTIPLIER = 0.6;
export const MODAL_IMAGE_SCREEN_MULTIPLIER = 0.6;

export const BANNER_IMAGE_SCREEN_SIZE = BANNER_IMAGE_SCREEN_MULTIPLIER * BASE_SCREEN_DIMENSION;
export const CAROUSEL_IMAGE_SCREEN_SIZE = CAROUSEL_IMAGE_SCREEN_MULTIPLIER * BASE_SCREEN_DIMENSION;
export const FULL_SCREEN_IMAGE_SCREEN_SIZE = FULL_SCREEN_IMAGE_SCREEN_MULTIPLIER * BASE_SCREEN_DIMENSION;
export const MODAL_IMAGE_SCREEN_SIZE = MODAL_IMAGE_SCREEN_MULTIPLIER * BASE_SCREEN_DIMENSION;

export const INITIAL_IMAGE_DIMENSIONS: ImageDimensions = { height: null, width: null };
