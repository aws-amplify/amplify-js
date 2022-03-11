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

import React from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import icons from '../../../icons';
import { IN_APP_MESSAGING } from '../../../AmplifyTestIDs';
import { Button, DEFAULT_CAROUSEL_INDICATOR_SIZE, IconButton } from '../../ui';

import { ICON_BUTTON_HIT_SLOP, ICON_BUTTON_SIZE, SPACING_EXTRA_LARGE } from '../constants';
import { useMessageProps } from '../hooks';
import MessageWrapper from '../MessageWrapper';

import { getStyles } from './styles';
import { FullScreenMessageProps } from './types';

// indicator size + indicator margins
const DEFAULT_CAROUSEL_INDICATOR_PADDING = (DEFAULT_CAROUSEL_INDICATOR_SIZE * 5) / 3;

export default function FullScreenMessage(props: FullScreenMessageProps) {
	const { body, header, image, isCarouselItem, onClose, primaryButton, secondaryButton } = props;
	const { hasButtons, hasPrimaryButton, hasRenderableImage, hasSecondaryButton, shouldRenderMessage, styles } =
		useMessageProps(props, getStyles);

	if (!shouldRenderMessage) {
		return null;
	}

	const ComponentWrapper = isCarouselItem ? SafeAreaView : MessageWrapper;

	return (
		<ComponentWrapper style={styles.componentWrapper}>
			<View
				style={[
					styles.container,
					isCarouselItem && { paddingBottom: SPACING_EXTRA_LARGE + DEFAULT_CAROUSEL_INDICATOR_PADDING },
				]}
			>
				<View style={styles.contentContainer}>
					<IconButton
						color={styles.iconButton.iconColor}
						hitSlop={ICON_BUTTON_HIT_SLOP}
						onPress={onClose}
						size={ICON_BUTTON_SIZE}
						source={icons.close}
						style={styles.iconButton.container}
						testID={IN_APP_MESSAGING.CLOSE_BUTTON}
					/>
					{hasRenderableImage && (
						<View style={styles.imageContainer}>
							<Image source={{ uri: image?.src }} style={styles.image} testID={IN_APP_MESSAGING.IMAGE} />
						</View>
					)}
					<View style={styles.textContainer}>
						{header?.content && (
							<Text style={styles.header} testID={IN_APP_MESSAGING.HEADER}>
								{header.content}
							</Text>
						)}
						{body?.content && (
							<Text style={styles.body} testID={IN_APP_MESSAGING.BODY}>
								{body.content}
							</Text>
						)}
					</View>
				</View>
				{hasButtons && (
					<View style={styles.buttonsContainer}>
						{hasSecondaryButton && (
							<Button
								onPress={secondaryButton.onPress}
								style={styles.secondaryButton.container}
								testID={IN_APP_MESSAGING.SECONDARY_BUTTON}
								textStyle={styles.secondaryButton.text}
							>
								{secondaryButton.title}
							</Button>
						)}
						{hasPrimaryButton && (
							<Button
								onPress={primaryButton.onPress}
								style={styles.primaryButton.container}
								testID={IN_APP_MESSAGING.PRIMARY_BUTTON}
								textStyle={styles.primaryButton.text}
							>
								{primaryButton.title}
							</Button>
						)}
					</View>
				)}
			</View>
		</ComponentWrapper>
	);
}
