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

import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { InAppMessageStyle } from '@aws-amplify/notifications';

import { InAppMessageComponentBaseProps, InAppMessageComponentButtonStyle } from '../../types';
import { MessageStylePropParams, MessageStyleProps } from './types';

/**
 * Parse and assign appropriate button container and text style from style objects params
 *
 * @param {defaultButtonStyle} object - default button style specified at the component level
 * @param {messageButtonStyle} object - message button style from message payload
 * @param {overrideStyle} object - custom style passed to component
 *
 * @returns {InAppMessageComponentButtonStyle} resolved button container and text style arrays
 */
export const getButtonComponentStyle = (
	defaultButtonStyle: { buttonContainer: ViewStyle; buttonText: TextStyle },
	messageButtonStyle: InAppMessageStyle,
	overrideStyle: InAppMessageComponentButtonStyle
): InAppMessageComponentButtonStyle => {
	// default component styles defined at the UI component level
	const { buttonContainer, buttonText } = defaultButtonStyle;

	// message specific styles in the in-app message payload, overrides default component styles
	const { backgroundColor, borderRadius, color } = messageButtonStyle ?? {};

	// custom component override styles passed as style prop, overrides all previous styles
	const { container, text } = overrideStyle ?? {};

	return {
		container: [buttonContainer, { backgroundColor, borderRadius }, container],
		text: [buttonText, { color }, text],
	};
};

/**
 * Parse and assign appropriate message container and wapper style from style objects params
 *
 * @param {params} object - contains message styleParams and layout
 * @returns {object} contains resolved containerStyle and wrapperStyle
 */

export const getContainerAndWrapperStyle = ({ styleParams, layout }: MessageStylePropParams) => {
	const { defaultStyle, messageStyle, overrideStyle } = styleParams;

	// banner layouts requires no special handling of container or wrapper styles
	if (layout === 'TOP_BANNER' || layout === 'MIDDLE_BANNER' || layout === 'BOTTOM_BANNER') {
		return {
			container: [defaultStyle.container, messageStyle?.container, overrideStyle?.container],
			wrapper: defaultStyle.wrapper,
		};
	}

	// in non-banner layouts the message and override container backgroundColor values are passed inside
	// wrapperStyle to the MessageWrapper to ensure that the is applied to the entire screen
	const { container: baseOverrideContainerStyle } = overrideStyle ?? {};

	// flatten overrideStyles to access override backgroundColor
	const flattenedOverrideStyles = StyleSheet.flatten(baseOverrideContainerStyle);
	const { backgroundColor: overrideBackgroundColor, ...overrideContainerStyle } = flattenedOverrideStyles ?? {};
	const { backgroundColor: messageBackgroundColor, ...messageContainerStyle } = messageStyle?.container;

	// default and all non-backgroundColor container override style are applied to the container View
	const container = [defaultStyle.container, messageContainerStyle, overrideContainerStyle];

	// use ternaries to prevent passing backgroundColor object with undefined or null value
	const wrapper: StyleProp<ViewStyle> = [
		defaultStyle.wrapper,
		messageBackgroundColor ? { backgroundColor: messageBackgroundColor } : null,
		overrideBackgroundColor ? { backgroundColor: overrideBackgroundColor } : null,
	];

	return { container, wrapper };
};

/**
 * Utility for extracting message payload style
 *
 * @param {props} - message props
 * @returns message payload specific style
 */

export const getMessageStyle = ({
	body,
	container,
	header,
	primaryButton,
	secondaryButton,
}: InAppMessageComponentBaseProps) => ({
	body: body?.style ?? {},
	container: container?.style ?? {},
	header: header?.style ?? {},
	primaryButton: primaryButton?.style ?? {},
	secondaryButton: secondaryButton?.style ?? {},
});

/**
 * Receives message styling and returns style property values for use with in-app message
 * UI components. Handles resolvement style precedence between default, payload, and custom style
 *
 * @param {params} object - contains message style params and layout
 *
 * Style param resolve precedence from lowest to highest:
 *   1. defaultStyle
 *   2. messageStyle
 *   3. overrideStyle
 *
 * @returns {MessageStyleProps} resolved message style props
 */

export function getMessageStyleProps({ styleParams, layout }: MessageStylePropParams): MessageStyleProps {
	// view style applied to the container and wrapper views
	const { container, wrapper } = getContainerAndWrapperStyle({ styleParams, layout });

	const { defaultStyle, messageStyle, overrideStyle } = styleParams;

	// image style composed of default and override style
	const image = [defaultStyle.image, overrideStyle?.image];

	const iconButton = {
		// view style applied to icon button
		container: [defaultStyle.iconButton, overrideStyle?.closeIconButton],
		// close icon color, only specified as an overrideStyle
		iconColor: overrideStyle?.closeIconColor,
	};

	// text style applied to message body and header respectively
	const body = [defaultStyle.body, messageStyle?.body, overrideStyle?.body];
	const header = [defaultStyle.header, messageStyle?.header, overrideStyle?.header];

	// primary and secondary button container and text style
	const primaryButton = getButtonComponentStyle(
		defaultStyle,
		messageStyle?.primaryButton,
		overrideStyle?.primaryButton
	);
	const secondaryButton = getButtonComponentStyle(
		defaultStyle,
		messageStyle?.secondaryButton,
		overrideStyle?.secondaryButton
	);

	const { buttonsContainer, contentContainer, imageContainer, textContainer } = defaultStyle;

	return {
		body,
		buttonsContainer,
		contentContainer,
		container,
		header,
		iconButton,
		image,
		imageContainer,
		primaryButton,
		secondaryButton,
		textContainer,
		wrapper,
	};
}
