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

import { ImageStyle, StyleSheet } from 'react-native';
import {
	BORDER_RADIUS_BASE,
	COLOR_LIGHT_GREY,
	COLOR_WHITE,
	FONT_SIZE_BASE,
	FONT_SIZE_LARGE,
	FONT_WEIGHT_BASE,
	LINE_HEIGHT_BASE,
	LINE_HEIGHT_LARGE,
	SPACING_EXTRA_LARGE,
	SPACING_LARGE,
	SPACING_MEDIUM,
	SPACING_SMALL,
	MODAL_SHADOW_HEIGHT,
	MODAL_SHADOW_OPACITY,
	MODAL_SHADOW_RADIUS,
	MODAL_SHADOW_WIDTH,
	COLOR_BLACK,
	MODAL_ELEVATION,
} from '../constants';

import { ModalMessageStyle } from './types';

export const getStyles = (imageDimensions: ImageStyle): ModalMessageStyle =>
	StyleSheet.create({
		body: {
			fontSize: FONT_SIZE_BASE,
			fontWeight: FONT_WEIGHT_BASE,
			lineHeight: LINE_HEIGHT_BASE,
		},
		buttonContainer: {
			backgroundColor: COLOR_LIGHT_GREY,
			borderRadius: BORDER_RADIUS_BASE,
			flex: 1,
			margin: SPACING_MEDIUM,
			padding: SPACING_LARGE,
		},
		buttonsContainer: {
			flexDirection: 'row',
			justifyContent: 'center',
		},
		buttonText: {
			fontSize: FONT_SIZE_BASE,
			fontWeight: FONT_WEIGHT_BASE,
			lineHeight: LINE_HEIGHT_BASE,
			textAlign: 'center',
		},
		componentWrapper: {
			backgroundColor: 'transparent',
		},
		container: {
			padding: SPACING_EXTRA_LARGE,
			margin: SPACING_EXTRA_LARGE,
			backgroundColor: COLOR_WHITE,
			shadowColor: COLOR_BLACK,
			shadowOffset: {
				width: MODAL_SHADOW_WIDTH,
				height: MODAL_SHADOW_HEIGHT,
			},
			shadowOpacity: MODAL_SHADOW_OPACITY,
			shadowRadius: MODAL_SHADOW_RADIUS,
			elevation: MODAL_ELEVATION,
		},
		contentContainer: {
			flexDirection: 'row',
			alignSelf: 'flex-end',
		},
		header: {
			fontSize: FONT_SIZE_LARGE,
			fontWeight: FONT_WEIGHT_BASE,
			lineHeight: LINE_HEIGHT_LARGE,
		},
		iconButton: {
			alignSelf: 'flex-start',
			alignItems: 'flex-end',
			marginBottom: SPACING_MEDIUM,
			marginLeft: 'auto',
			marginRight: SPACING_MEDIUM,
		},
		image: {
			...imageDimensions,
		},
		imageContainer: {
			flex: 1,
			alignItems: 'center',
			marginVertical: SPACING_LARGE,
		},
		textContainer: {
			marginHorizontal: SPACING_SMALL,
			marginVertical: SPACING_LARGE,
			paddingLeft: SPACING_MEDIUM,
		},
	});
