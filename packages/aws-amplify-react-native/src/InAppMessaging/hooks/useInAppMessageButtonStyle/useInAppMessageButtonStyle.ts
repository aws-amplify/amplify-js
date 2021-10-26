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

import { InAppMessageComponentButtonStyle } from '../../components';
import { UseInAppMessageButtonStyleParams } from './types';

const getButtonComponentStyle = (
	baseStyle: { buttonContainer: ViewStyle; buttonText: TextStyle },
	messageStyle: InAppMessageStyle,
	overrideStyle: InAppMessageComponentButtonStyle
): InAppMessageComponentButtonStyle => {
	// default component styles defined at the UI component level
	const { buttonContainer, buttonText } = baseStyle;

	// message specific styles in the in-app message payload, overrides default component styles
	const { backgroundColor, color, textAlign } = messageStyle ?? {};

	// custom component override styles passed as style prop, overrides all previous styles
	const { container, text } = overrideStyle ?? {};

	return {
		container: [buttonContainer, { backgroundColor }, container],
		text: [buttonText, { color, textAlign }, text],
	};
};

export default function useInAppMessageButtonStyle({
	baseButtonStyle,
	messageButtonStyle,
	overrideButtonStyle,
}: UseInAppMessageButtonStyleParams) {
	return useMemo(
		() => ({
			primaryButtonStyle: getButtonComponentStyle(
				baseButtonStyle,
				messageButtonStyle?.primaryButton,
				overrideButtonStyle?.primaryButton
			),
			secondaryButtonStyle: getButtonComponentStyle(
				baseButtonStyle,
				messageButtonStyle?.secondaryButton,
				overrideButtonStyle?.secondaryButton
			),
		}),
		[baseButtonStyle, messageButtonStyle, overrideButtonStyle]
	);
}
