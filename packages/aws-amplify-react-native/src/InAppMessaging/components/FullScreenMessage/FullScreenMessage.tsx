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
import { Button, IconButton } from '../../ui';

import { ICON_BUTTON_HIT_SLOP, ICON_BUTTON_SIZE } from '../constants';
import { useMessageProps } from '../hooks';
import MessageWrapper from '../MessageWrapper';

import { getStyles } from './styles';
import { FullScreenMessageProps } from './types';

export default function FullScreenMessage(props: FullScreenMessageProps) {
	const { body, header, image, onClose, primaryButton, secondaryButton } = props;
	const { renderButtons, renderImage, renderMessage, renderSecondaryButton, styles } = useMessageProps(
		props,
		getStyles
	);

	if (!renderMessage) {
		return null;
	}

	return (
		<MessageWrapper style={styles.wrapper}>
			<View style={styles.container}>
				<View style={styles.contentContainer}>
					<IconButton
						color={styles.iconButton.iconColor}
						hitSlop={ICON_BUTTON_HIT_SLOP}
						onPress={onClose}
						size={ICON_BUTTON_SIZE}
						source={icons.close}
						style={styles.iconButton.container}
					/>
					{renderImage && (
						<View style={styles.imageContainer}>
							<Image source={{ uri: image?.src }} style={styles.image} />
						</View>
					)}
					<View style={styles.textContainer}>
						{header?.content && <Text style={styles.header}>{header.content}</Text>}
						{body?.content && <Text style={styles.body}>{body.content}</Text>}
					</View>
				</View>
				{renderButtons && (
					<View style={styles.buttonsContainer}>
						{renderSecondaryButton && (
							<Button
								onPress={secondaryButton.onPress}
								style={styles.secondaryButton.container}
								textStyle={styles.secondaryButton.text}
							>
								{secondaryButton.title}
							</Button>
						)}
						{renderSecondaryButton && (
							<Button
								onPress={primaryButton.onPress}
								style={styles.primaryButton.container}
								textStyle={styles.primaryButton.text}
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
