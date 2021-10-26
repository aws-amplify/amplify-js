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

import { useMemo } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { InAppMessageStyle } from '@aws-amplify/notifications';

import { InAppMessageComponentButtonProps, InAppMessageComponentButtonStyle } from '../../components/types';

const getButtonComponentStyle = (
	componentStyle: { buttonContainer: ViewStyle; buttonText: TextStyle },
	messageStyle: InAppMessageStyle,
	overrideStyle: InAppMessageComponentButtonStyle
): InAppMessageComponentButtonStyle => {
	// default component styles defined at the UI component level
	const { buttonContainer, buttonText } = componentStyle;

	// message specific styles passed in the in-app nessage payload, overrides default component styles
	const { backgroundColor, color, textAlign } = messageStyle;

	// custom component override styles passed as style prop, overrides all previous styles
	const { container, text } = overrideStyle ?? {};

	return {
		container: [buttonContainer, { backgroundColor }, container],
		text: [buttonText, { color, textAlign }, text],
	};
};

export default function useInAppMessageButtonStyle({
	buttons: { primaryButton, secondaryButton },
	componentStyle,
	overrideStyle,
}: {
	buttons: { primaryButton: InAppMessageComponentButtonProps; secondaryButton: InAppMessageComponentButtonProps };
	componentStyle: { buttonContainer: ViewStyle; buttonText: TextStyle };
	overrideStyle: {
		primaryButton?: InAppMessageComponentButtonStyle;
		secondaryButton?: InAppMessageComponentButtonStyle;
	};
}) {
	return useMemo(
		() => ({
			primaryButtonStyle:
				primaryButton && getButtonComponentStyle(componentStyle, primaryButton.style, overrideStyle?.primaryButton),
			secondaryButtonStyle:
				secondaryButton &&
				getButtonComponentStyle(componentStyle, secondaryButton.style, overrideStyle?.secondaryButton),
		}),
		[componentStyle, primaryButton, overrideStyle?.primaryButton, secondaryButton, overrideStyle?.secondaryButton]
	);
}
