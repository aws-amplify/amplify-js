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

import { StyleSheet } from 'react-native';

import { getLineHeight } from '../utils';
import {
	BANNER_ELEVATION,
	BANNER_SHADOW_HEIGHT,
	BANNER_SHADOW_OPACITY,
	BANNER_SHADOW_RADIUS,
	BANNER_SHADOW_WIDTH,
	BASE_SPACING,
	BASE_FONT_SIZE,
	BASE_FONT_WEIGHT,
	BLACK,
	BUTTON_BORDER_RADIUS,
	EXTRA_LARGE_SPACING,
	LARGE_SPACING,
	LARGE_FONT_SIZE,
	LIGHT_GREY,
	SMALL_SPACING,
	WHITE,
} from '../constants';
import { BannerMessageStyle } from './types';

export const styles: BannerMessageStyle = StyleSheet.create({
	// position style
	positionContainer: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	bottom: {
		justifyContent: 'flex-end',
	},
	middle: {
		justifyContent: 'center',
	},
	top: {
		justifyContent: 'flex-start',
	},

	// shared style
	buttonContainer: {
		backgroundColor: LIGHT_GREY,
		borderRadius: BUTTON_BORDER_RADIUS,
		flex: 1,
		margin: BASE_SPACING,
		padding: LARGE_SPACING,
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		paddingHorizontal: SMALL_SPACING,
	},
	buttonText: {
		fontSize: BASE_FONT_SIZE,
		fontWeight: BASE_FONT_WEIGHT,
		lineHeight: getLineHeight(BASE_FONT_SIZE),
		textAlign: 'center',
	},
	container: {
		backgroundColor: WHITE,
		elevation: BANNER_ELEVATION,
		margin: EXTRA_LARGE_SPACING,
		shadowColor: BLACK,
		shadowOffset: {
			width: BANNER_SHADOW_WIDTH,
			height: BANNER_SHADOW_HEIGHT,
		},
		shadowOpacity: BANNER_SHADOW_OPACITY,
		shadowRadius: BANNER_SHADOW_RADIUS,
	},
	contentContainer: {
		flexDirection: 'row',
		padding: LARGE_SPACING,
	},
	header: {
		fontSize: LARGE_FONT_SIZE,
		fontWeight: BASE_FONT_WEIGHT,
		lineHeight: getLineHeight(LARGE_FONT_SIZE),
	},
	iconButton: {
		alignSelf: 'flex-start',
		marginLeft: 'auto',
	},
	imageContainer: {
		justifyContent: 'center',
	},
	message: {
		fontSize: BASE_FONT_SIZE,
		fontWeight: BASE_FONT_WEIGHT,
		lineHeight: getLineHeight(BASE_FONT_SIZE),
	},
	textContainer: {
		marginHorizontal: SMALL_SPACING,
		paddingLeft: BASE_SPACING,
		flex: 1,
	},
});
