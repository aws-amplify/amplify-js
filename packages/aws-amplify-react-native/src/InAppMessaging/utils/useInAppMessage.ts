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

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import {
	InAppMessageAction,
	InAppMessageButton,
	InAppMessageContent,
	InAppMessageLayout,
} from '@aws-amplify/notifications';

import {
	BannerMessageProps,
	CarouselMessageProps,
	FullScreenMessageProps,
	InAppMessageButtonProps,
	InAppMessageComponent,
	InAppMessageComponents,
	InAppMessageComponentProps,
	InAppMessageContentProps,
	InAppMessagePosition,
	useInAppMessaging,
} from '..';

import handleAction from './handleAction';
import getInAppMessage from './getInAppMessage';

const logger = new Logger('InAppMessaging');

// TODO: replace with Amplify default components
const DefaultBannerMessage: InAppMessageComponents['BannerMessage'] = () =>
	null;
const DefaultCarouselMessage: InAppMessageComponents['CarouselMessage'] = () =>
	null;
const DefaultFullScreenMessage: InAppMessageComponents['FullScreenMessage'] = () =>
	null;

const getPositionProp = (layout: InAppMessageLayout): InAppMessagePosition =>
	InAppMessagePosition[layout];

const getActionHandler = (
	action: InAppMessageAction,
	url: string,
	onActionCallback: () => void
) => ({
	onPress: async function() {
		try {
			await handleAction(action, url);
		} catch (e) {
			logger.error(`handleAction failure: ${e}`);
		} finally {
			onActionCallback();
		}
	},
});

const getButtonProps = (
	{ action, url, ...baseButtonProps }: InAppMessageButton,
	onActionCallback: () => void
): InAppMessageButtonProps => ({
	...baseButtonProps,
	...getActionHandler(action, url, onActionCallback),
});

const getContentProps = (
	{ primaryButton, secondaryButton, ...baseContentProps }: InAppMessageContent,
	onActionCallback: () => void
): InAppMessageContentProps => ({
	...baseContentProps,
	primaryButton: getButtonProps(primaryButton, onActionCallback),
	secondaryButton: getButtonProps(secondaryButton, onActionCallback),
});

export default function useInAppMessage(): {
	Component: InAppMessageComponent;
	props: InAppMessageComponentProps;
} {
	const { clearInAppMessages, components, inAppMessages } = useInAppMessaging();
	const {
		BannerMessage = DefaultBannerMessage,
		CarouselMessage = DefaultCarouselMessage,
		FullScreenMessage = DefaultFullScreenMessage,
	} = components;

	const { content, id, layout } = getInAppMessage(inAppMessages);

	const onClose = () => {
		// TODO: add dismiss notify handler when available
		clearInAppMessages();
	};

	const onActionCallback = () => {
		// TODO: add action notify handler when available
		clearInAppMessages();
	};

	switch (layout) {
		case 'BOTTOM_BANNER':
		case 'MIDDLE_BANNER':
		case 'TOP_BANNER': {
			const props: BannerMessageProps = {
				...getContentProps(content[0], onActionCallback),
				id,
				onClose,
				position: getPositionProp(layout),
			};
			return { Component: BannerMessage, props };
		}
		case 'CAROUSEL': {
			const props: CarouselMessageProps = {
				data: content.map(item => getContentProps(item, onActionCallback)),
				id,
				onClose,
			};
			return { Component: CarouselMessage, props };
		}
		case 'OVERLAYS': {
			const props: FullScreenMessageProps = {
				...getContentProps(content[0], onActionCallback),
				id,
				onClose,
			};
			return { Component: FullScreenMessage, props };
		}
		default: {
			return { Component: null, props: {} as InAppMessageComponentProps };
		}
	}
}
