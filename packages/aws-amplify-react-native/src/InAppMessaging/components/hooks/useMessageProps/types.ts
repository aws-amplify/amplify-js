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

import { ColorValue, ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { InAppMessageLayout, InAppMessageStyle } from '@aws-amplify/notifications';

import {
	InAppMessageComponentBaseStyle,
	InAppMessageComponentButtonStyle,
	InAppMessageComponentStyle,
} from '../../types';
import { DeviceOrientation } from '../useDeviceOrientation';
import { ImageDimensions } from '../useMessageImage';

type InAppMessagePayloadStyle = {
	body?: InAppMessageStyle;
	container?: InAppMessageStyle;
	header?: InAppMessageStyle;
	primaryButton?: InAppMessageStyle;
	secondaryButton?: InAppMessageStyle;
};

export type MessageStyleProps = {
	body: StyleProp<TextStyle>;
	buttonsContainer: StyleProp<ViewStyle>;
	componentWrapper: StyleProp<ViewStyle>;
	container: StyleProp<ViewStyle>;
	contentContainer: StyleProp<ViewStyle>;
	header: StyleProp<TextStyle>;
	iconButton: { container: StyleProp<ViewStyle>; iconColor: ColorValue };
	imageContainer: StyleProp<ViewStyle>;
	image: StyleProp<ImageStyle>;
	pageIndicator?: { active: StyleProp<ViewStyle>; inactive: StyleProp<ViewStyle> };
	primaryButton: InAppMessageComponentButtonStyle;
	secondaryButton: InAppMessageComponentButtonStyle;
	textContainer: StyleProp<ViewStyle>;
};

export type GetDefaultStyle = (
	imageDimensions?: ImageDimensions,
	additionalStyle?: Record<string, ImageStyle | TextStyle | ViewStyle>
) => InAppMessageComponentBaseStyle;

export type UseMessageProps = {
	hasButtons: boolean;
	hasPrimaryButton: boolean;
	hasRenderableImage: boolean;
	hasSecondaryButton: boolean;
	shouldRenderMessage: boolean;
	styles: MessageStyleProps;
};

export type StyleParams = {
	/**
	 * default component styles defined at the UI component level
	 */
	defaultStyle: InAppMessageComponentBaseStyle;

	/**
	 * message specific styles in the message payload
	 */
	messageStyle: InAppMessagePayloadStyle;

	/**
	 * custom component style passed as style prop to message UI components
	 */
	overrideStyle: InAppMessageComponentStyle;
};

export type MessageStylePropParams = {
	/**
	 * message specific layout
	 */
	layout: InAppMessageLayout;

	/**
	 * current device orientation
	 */
	orientation: DeviceOrientation;

	/**
	 * style params to derive resolved style from
	 */
	styleParams: StyleParams;
};

export type ButtonStylePropParams = {
	/**
	 * message button types
	 */
	buttonType: 'primaryButton' | 'secondaryButton';

	/**
	 * style params to derive resolved style from
	 */
	styleParams: StyleParams;
};
