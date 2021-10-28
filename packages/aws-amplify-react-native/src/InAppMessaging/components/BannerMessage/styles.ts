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
	BLACK,
	BORDER_RADIUS_BASE,
	FONT_SIZE_BASE,
	FONT_SIZE_LARGE,
	FONT_WEIGHT_BASE,
	LIGHT_GREY,
	SPACING_EXTRA_LARGE,
	SPACING_LARGE,
	SPACING_MEDIUM,
	SPACING_SMALL,
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
		borderRadius: BORDER_RADIUS_BASE,
		flex: 1,
		margin: SPACING_MEDIUM,
		padding: SPACING_LARGE,
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		paddingHorizontal: SPACING_SMALL,
	},
	buttonText: {
		fontSize: FONT_SIZE_BASE,
		fontWeight: FONT_WEIGHT_BASE,
		lineHeight: getLineHeight(FONT_SIZE_BASE),
		textAlign: 'center',
	},
	container: {
		backgroundColor: WHITE,
		elevation: BANNER_ELEVATION,
		margin: SPACING_EXTRA_LARGE,
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
		padding: SPACING_LARGE,
	},
	header: {
		fontSize: FONT_SIZE_LARGE,
		fontWeight: FONT_WEIGHT_BASE,
		lineHeight: getLineHeight(FONT_SIZE_LARGE),
	},
	iconButton: {
		alignSelf: 'flex-start',
		marginLeft: 'auto',
	},
	imageContainer: {
		justifyContent: 'center',
	},
	message: {
		fontSize: FONT_SIZE_BASE,
		fontWeight: FONT_WEIGHT_BASE,
		lineHeight: getLineHeight(FONT_SIZE_BASE),
	},
	textContainer: {
		marginHorizontal: SPACING_SMALL,
		paddingLeft: SPACING_MEDIUM,
		flex: 1,
	},
});
