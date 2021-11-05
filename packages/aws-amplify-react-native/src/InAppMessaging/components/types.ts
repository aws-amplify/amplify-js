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

import { ColorValue, ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { InAppMessageButton, InAppMessageContent, InAppMessageLayout } from '@aws-amplify/notifications';

export type InAppMessageComponentButtonStyle = {
	container?: StyleProp<ViewStyle>;
	text?: StyleProp<TextStyle>;
};

export type InAppMessageComponentStyle = {
	body?: StyleProp<TextStyle>;
	closeIconButton?: StyleProp<ViewStyle>;
	closeIconColor?: ColorValue;
	container?: StyleProp<ViewStyle>;
	header?: StyleProp<TextStyle>;
	image?: StyleProp<ImageStyle>;
	primaryButton?: InAppMessageComponentButtonStyle;
	secondaryButton?: InAppMessageComponentButtonStyle;
};

export type InAppMessageComponentStyles = {
	BannerMessage?: InAppMessageComponentStyle;
	CarouselMessage?: InAppMessageComponentStyle;
	FullScreenMessage?: InAppMessageComponentStyle;
	ModalMessage?: InAppMessageComponentStyle;
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

export interface InAppMessageComponentBaseProps extends InAppMessageComponentContentProps {
	layout: InAppMessageLayout;
	onClose?: () => void;
	onDisplay?: () => void;
	style?: InAppMessageComponentStyle;
}

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
	textContainer: ViewStyle;
}
