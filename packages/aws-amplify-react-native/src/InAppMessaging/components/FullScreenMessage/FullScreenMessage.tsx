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

import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import isEmpty from 'lodash/isEmpty';

import icons from '../../../icons';
import { useInAppMessageButtonStyle, useInAppMessageImage } from '../../hooks';
import { Button, IconButton } from '../../ui';

import { ICON_BUTTON_HIT_SLOP, ICON_BUTTON_SIZE } from '../constants';
import MessageWrapper from '../MessageWrapper';
import { styles } from './styles';
import { FullScreenMessageProps } from './types';

export default function FullScreenMessage({
	body,
	container,
	header,
	image,
	layout,
	onClose,
	primaryButton,
	secondaryButton,
	style,
}: FullScreenMessageProps) {
	const { imageStyle, shouldDelayMessageRendering, shouldRenderImage } = useInAppMessageImage(image, layout);

	const messageButtonStyle = { primaryButton: primaryButton?.style, secondaryButton: secondaryButton?.style };
	const { primaryButtonStyle, secondaryButtonStyle } = useInAppMessageButtonStyle({
		baseButtonStyle: styles,
		messageButtonStyle,
		overrideButtonStyle: style,
	});

	const hasPrimaryButton = !isEmpty(primaryButton);
	const hasSecondaryButton = !isEmpty(secondaryButton);

	// due to limitations with passing spacing style to the underlying style prop of the SafeAreaView of the
	// MessageWrapper, only pass backgroundColor as a message or override style, apply all other override style
	// values to container View
	const { containerStyle, wrapperStyle } = useMemo(() => {
		const { container: baseOverrideContainerStyle } = style ?? {};
		const { backgroundColor, ...overrideContainerStyle } = Array.isArray(baseOverrideContainerStyle)
			? StyleSheet.flatten(baseOverrideContainerStyle)
			: (baseOverrideContainerStyle as ViewStyle) ?? {};

		return {
			containerStyle: [styles.container, overrideContainerStyle],

			// prevent passing object with backgroundColor key and undefined or null value
			// to avoid overriding payload backgroundColor
			wrapperStyle: [container?.style, backgroundColor ? { backgroundColor } : null],
		};
	}, [container?.style, style]);

	return shouldDelayMessageRendering ? null : (
		<MessageWrapper style={wrapperStyle}>
			<View style={containerStyle}>
				<View style={styles.contentContainer}>
					<IconButton
						color={style?.closeIconColor}
						hitSlop={ICON_BUTTON_HIT_SLOP}
						onPress={onClose}
						size={ICON_BUTTON_SIZE}
						source={icons.close}
						style={[styles.iconButton, style?.closeIconButton]}
					/>
					{shouldRenderImage && (
						<View style={styles.imageContainer}>
							<Image source={{ uri: image?.src }} style={imageStyle} />
						</View>
					)}
					<View style={styles.textContainer}>
						{header?.content && <Text style={[styles.header, header.style, style?.header]}>{header.content}</Text>}
						{body?.content && <Text style={[styles.message, body.style, style?.message]}>{body.content}</Text>}
					</View>
				</View>
				{(hasPrimaryButton || hasSecondaryButton) && (
					<View style={styles.buttonsContainer}>
						{hasSecondaryButton && (
							<Button
								onPress={secondaryButton.onPress}
								style={secondaryButtonStyle.container}
								textStyle={secondaryButtonStyle.text}
							>
								{secondaryButton.title}
							</Button>
						)}
						{hasPrimaryButton && (
							<Button
								onPress={primaryButton.onPress}
								style={primaryButtonStyle.container}
								textStyle={primaryButtonStyle.text}
							>
								{primaryButton.title}
							</Button>
						)}
					</View>
				)}
			</View>
		</MessageWrapper>
	);
}
