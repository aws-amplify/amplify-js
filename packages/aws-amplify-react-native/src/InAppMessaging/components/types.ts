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
import { InAppMessageButton, InAppMessageContent, InAppMessageLayout } from '@aws-amplify/notifications';

import { ButtonProps } from '../ui';

export type InAppMessageComponentButtonStyle = {
	container?: ButtonProps['style'];
	text?: ButtonProps['textStyle'];
};

type InAppMessageComponentCommonStyle = {
	body?: StyleProp<TextStyle>;
	closeIconButton?: StyleProp<ViewStyle>;
	closeIconColor?: ColorValue;
	container?: StyleProp<ViewStyle>;
	header?: StyleProp<TextStyle>;
	image?: StyleProp<ImageStyle>;
	primaryButton?: InAppMessageComponentButtonStyle;
	secondaryButton?: InAppMessageComponentButtonStyle;
};

export type InAppMessageBannerMessageStyle = InAppMessageComponentCommonStyle;

export type InAppMessageCarouselMessageStyle = InAppMessageComponentCommonStyle & {
	pageIndicatorActive?: StyleProp<ViewStyle>;
	pageIndicatorInactive?: StyleProp<ViewStyle>;
};

export type InAppMessageFullScreenMessageStyle = InAppMessageComponentCommonStyle;

export type InAppMessageModalMessageStyle = InAppMessageComponentCommonStyle;

export type InAppMessageComponentStyle = InAppMessageBannerMessageStyle &
	InAppMessageCarouselMessageStyle &
	InAppMessageFullScreenMessageStyle &
	InAppMessageModalMessageStyle;

export type InAppMessageComponentStyles = {
	BannerMessage?: InAppMessageComponentCommonStyle;
	CarouselMessage?: InAppMessageComponentCommonStyle;
	FullScreenMessage?: InAppMessageComponentCommonStyle;
	ModalMessage?: InAppMessageComponentCommonStyle;
};

export type InAppMessageComponentPosition = 'bottom' | 'middle' | 'top' | null;

export interface InAppMessageComponentButtonProps extends Omit<InAppMessageButton, 'action' | 'url'> {
	onPress: () => void;
}

export interface InAppMessageComponentContentProps
	extends Omit<InAppMessageContent, 'primaryButton' | 'secondaryButton'> {
	primaryButton?: InAppMessageComponentButtonProps;
	secondaryButton?: InAppMessageComponentButtonProps;
}

export interface InAppMessageComponentCommonProps {
	layout: InAppMessageLayout;
	onClose?: () => void;
	onDisplay?: () => void;
	style?: InAppMessageComponentStyle;
}

export interface InAppMessageComponentBaseProps
	extends InAppMessageComponentCommonProps,
		InAppMessageComponentContentProps {}

export interface InAppMessageComponentBaseStyle {
	body: TextStyle;
	buttonContainer: ViewStyle;
	buttonsContainer: ViewStyle;
	buttonText: TextStyle;
	componentWrapper: ViewStyle;
	container: ViewStyle;
	contentContainer: ViewStyle;
	header: TextStyle;
	iconButton: ViewStyle;
	image: ImageStyle;
	imageContainer: ViewStyle;
	pageIndicatorActive?: ViewStyle;
	pageIndicatorInactive?: ViewStyle;
	textContainer: ViewStyle;
}
