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

import { TextStyle, ViewStyle } from 'react-native';
import { InAppMessageComponentPosition, InAppMessageComponentBaseProps } from '../types';

export interface BannerMessageProps extends InAppMessageComponentBaseProps {
	position: InAppMessageComponentPosition;
}

export interface BannerMessageStyle {
	// position specific style
	bottom: ViewStyle;
	middle: ViewStyle;
	top: ViewStyle;

	// component style
	buttonContainer: ViewStyle;
	buttonsContainer: ViewStyle;
	buttonText: TextStyle;
	container: ViewStyle;
	contentContainer: ViewStyle;
	header: TextStyle;
	iconButton: ViewStyle;
	imageContainer: ViewStyle;
	message: TextStyle;
	positionContainer: ViewStyle;
	textContainer: ViewStyle;
}
