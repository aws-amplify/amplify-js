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

import React from 'react';
import { Image, Text, View } from 'react-native';

import icons from '../../../icons';
import { ICON_BUTTON_HIT_SLOP, ICON_BUTTON_SIZE } from '../constants';
import { useInAppMessageButtonStyle, useInAppMessageImage } from '../../hooks';
import { Button, IconButton } from '../../ui';

import { MessageWrapper } from '../MessageWrapper';
import { styles } from './styles';
import { BannerMessageProps } from './types';

export default function BannerMessage({
	body,
	container,
	header,
	image,
	layout,
	onClose,
	position,
	primaryButton,
	secondaryButton,
	style,
}: BannerMessageProps) {
	const { imageStyle, shouldDelayMessageRendering, shouldRenderImage } = useInAppMessageImage(image, layout);
	const { primaryButtonStyle, secondaryButtonStyle } = useInAppMessageButtonStyle({
		baseButtonStyle: styles,
		messageButtonStyle: { primaryButton: primaryButton?.style, secondaryButton: secondaryButton?.style },
		overrideButtonStyle: style,
	});

	return shouldDelayMessageRendering ? null : (
		<MessageWrapper>
			<View style={[styles.positionContainer, styles[position]]}>
				<View style={[styles.container, container?.style, style?.container]}>
					<View style={styles.contentContainer}>
						{shouldRenderImage && (
							<View style={styles.imageContainer}>
								<Image source={{ uri: image.src }} style={imageStyle} />
							</View>
						)}
						<View style={styles.textContainer}>
							{header?.content && <Text style={[styles.header, header.style, style?.header]}>{header.content}</Text>}
							{body?.content && <Text style={[styles.message, body.style, style?.message]}>{body.content}</Text>}
						</View>
						<IconButton
							color={style?.closeIconColor}
							hitSlop={ICON_BUTTON_HIT_SLOP}
							onPress={onClose}
							size={ICON_BUTTON_SIZE}
							source={icons.close}
							style={[styles.iconButton, style?.closeIconButton]}
						/>
					</View>
					{primaryButton && (
						<View style={styles.buttonsContainer}>
							{secondaryButton && (
								<Button
									onPress={secondaryButton.onPress}
									style={secondaryButtonStyle.container}
									textStyle={secondaryButtonStyle.text}
								>
									{secondaryButton.title}
								</Button>
							)}
							<Button
								onPress={primaryButton.onPress}
								style={primaryButtonStyle.container}
								textStyle={primaryButtonStyle.text}
							>
								{primaryButton.title}
							</Button>
						</View>
					)}
				</View>
			</View>
		</MessageWrapper>
	);
}
