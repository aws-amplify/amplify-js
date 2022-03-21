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

import { StyleSheet } from 'react-native';
import { COLOR_GREY, COLOR_LIGHT_GREY_2, COLOR_WHITE, SPACING_LARGE, SPACING_SMALL } from '../constants';

import { CarouselMessageStyle } from './types';

export const getStyles = (): CarouselMessageStyle =>
	StyleSheet.create({
		body: null,
		buttonContainer: null,
		buttonsContainer: null,
		buttonText: null,
		componentWrapper: {
			backgroundColor: COLOR_WHITE,
			flex: 1,
		},
		container: null,
		contentContainer: null,
		header: null,
		iconButton: null,
		image: null,
		imageContainer: null,
		pageIndicatorActive: {
			backgroundColor: COLOR_GREY,
			borderRadius: SPACING_LARGE / 2,
			height: SPACING_LARGE,
			margin: SPACING_SMALL,
			width: SPACING_LARGE,
		},
		pageIndicatorInactive: {
			backgroundColor: COLOR_LIGHT_GREY_2,
			borderRadius: SPACING_LARGE / 2,
			height: SPACING_LARGE,
			margin: SPACING_SMALL,
			width: SPACING_LARGE,
		},
		textContainer: {},
	});
