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

import { ImageStyle, StyleSheet, ViewStyle } from 'react-native';
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
	LINE_HEIGHT_BASE,
	LINE_HEIGHT_LARGE,
	SPACING_EXTRA_LARGE,
	SPACING_LARGE,
	SPACING_MEDIUM,
	SPACING_SMALL,
	WHITE,
} from '../constants';
import { BannerMessagePositionStyle, BannerMessageStyle } from './types';

export const positionStyle: BannerMessagePositionStyle = {
	bottom: {
		justifyContent: 'flex-end',
	},
	middle: {
		justifyContent: 'center',
	},
	top: {
		justifyContent: 'flex-start',
	},
};

export const getStyles = (imageDimensions: ImageStyle, additionalStyle: { position: ViewStyle }): BannerMessageStyle =>
	StyleSheet.create({
		body: {
			fontSize: FONT_SIZE_BASE,
			fontWeight: FONT_WEIGHT_BASE,
			lineHeight: LINE_HEIGHT_BASE,
		},
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
			lineHeight: LINE_HEIGHT_BASE,
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
			lineHeight: LINE_HEIGHT_LARGE,
		},
		iconButton: {
			alignSelf: 'flex-start',
			marginLeft: 'auto',
		},
		image: {
			...imageDimensions,
		},
		imageContainer: {
			justifyContent: 'center',
		},
		textContainer: {
			flex: 1,
			marginHorizontal: SPACING_SMALL,
			paddingLeft: SPACING_MEDIUM,
		},
		wrapper: {
			...additionalStyle.position,
			backgroundColor: 'transparent',
			flex: 1,
		},
	});
