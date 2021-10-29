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

import {
	BORDER_RADIUS_BASE,
	FONT_SIZE_BASE,
	FONT_SIZE_LARGE,
	FONT_WEIGHT_BASE,
	LIGHT_GREY,
	SPACING_EXTRA_LARGE,
	SPACING_LARGE,
	SPACING_MEDIUM,
	SPACING_SMALL,
} from '../constants';
import { getLineHeight } from '../utils';

import { FullScreenMessageStyle } from './types';

export const styles: FullScreenMessageStyle = {
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
	},
	buttonText: {
		fontSize: FONT_SIZE_BASE,
		fontWeight: FONT_WEIGHT_BASE,
		lineHeight: getLineHeight(FONT_SIZE_BASE),
		textAlign: 'center',
	},
	container: {
		padding: SPACING_EXTRA_LARGE,
		flex: 1,
	},
	contentContainer: {
		flex: 1,
	},
	header: {
		fontSize: FONT_SIZE_LARGE,
		fontWeight: FONT_WEIGHT_BASE,
		lineHeight: getLineHeight(FONT_SIZE_LARGE),
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
	message: {
		fontSize: FONT_SIZE_BASE,
		fontWeight: FONT_WEIGHT_BASE,
		lineHeight: getLineHeight(FONT_SIZE_BASE),
	},
	textContainer: {
		flex: 1,
		marginVertical: SPACING_LARGE,
		marginHorizontal: SPACING_SMALL,
		paddingLeft: SPACING_MEDIUM,
	},
};
