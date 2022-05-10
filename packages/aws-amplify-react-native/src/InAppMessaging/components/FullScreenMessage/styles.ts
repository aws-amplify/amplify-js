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
} from '../constants';

import { FullScreenMessageStyle } from './types';

const commonStyles: Omit<FullScreenMessageStyle, 'image'> = {
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
		backgroundColor: COLOR_WHITE,
	},
	container: {
		flex: 1,
		padding: SPACING_EXTRA_LARGE,
	},
	contentContainer: {
		flex: 1,
	},
	header: {
		fontSize: FONT_SIZE_LARGE,
		fontWeight: FONT_WEIGHT_BASE,
		lineHeight: LINE_HEIGHT_LARGE,
	},
	iconButton: {
		alignSelf: 'flex-start',
		marginBottom: SPACING_MEDIUM,
		marginLeft: 'auto',
		marginRight: SPACING_MEDIUM,
	},
	imageContainer: {
		alignItems: 'center',
		marginVertical: SPACING_LARGE,
	},
	textContainer: {
		flex: 1,
		marginHorizontal: SPACING_SMALL,
		marginVertical: SPACING_LARGE,
		paddingHorizontal: SPACING_MEDIUM,
	},
};

export const getPortraitStyles = (imageDimensions: ImageStyle): FullScreenMessageStyle =>
	StyleSheet.create({
		body: { ...commonStyles.body },
		buttonContainer: { ...commonStyles.buttonContainer },
		buttonText: { ...commonStyles.buttonText },
		buttonsContainer: { ...commonStyles.buttonsContainer },
		componentWrapper: { ...commonStyles.componentWrapper },
		container: { ...commonStyles.container },
		contentContainer: { ...commonStyles.contentContainer },
		header: { ...commonStyles.header },
		iconButton: { ...commonStyles.iconButton },
		image: { ...imageDimensions },
		imageContainer: { ...commonStyles.imageContainer },
		textContainer: { ...commonStyles.textContainer },
	});

export const getLandscapeStyles = (imageDimensions: ImageStyle): FullScreenMessageStyle =>
	StyleSheet.create({
		...commonStyles,
		componentWrapper: {
			...commonStyles.componentWrapper,
			flex: 1,
		},
		contentContainer: {
			...commonStyles.contentContainer,
			flexDirection: 'row',
		},
		iconButton: { ...commonStyles.iconButton },
		image: { ...imageDimensions },
		imageContainer: {
			...commonStyles.imageContainer,
			justifyContent: 'center',
		},
		textContainer: {
			...commonStyles.textContainer,
			justifyContent: 'center',
		},
	});
