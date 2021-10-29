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
import { Notifications, InAppMessageInteractionEvent } from '@aws-amplify/notifications';
import isNil from 'lodash/isNil';

import DefaultBannerMessage, { BannerMessageProps } from '../../BannerMessage';
import { CarouselMessageProps } from '../../CarouselMessage';
import DefaultFullScreenMessage, { FullScreenMessageProps } from '../../FullScreenMessage';

import { InAppMessageComponents } from '../../../context';
import { useInAppMessaging } from '../../../hooks';

import { InAppMessageComponent, InAppMessageComponentProps } from './types';
import { getContentProps, getPositionProp } from './utils';

const { InAppMessaging } = Notifications;

const logger = new Logger('Notifications.InAppMessaging');

// TODO: replace with Amplify default component
const DefaultCarouselMessage: InAppMessageComponents['CarouselMessage'] = () => null;

/**
 * Utility hook for parsing a message and retrieving its corresponding UI component and props
 *
 * @returns {object} contains the message UI component and props
 */
export default function useMessage(): {
	Component: InAppMessageComponent;
	props: InAppMessageComponentProps;
} {
	const { clearInAppMessage, components, inAppMessage, style } = useInAppMessaging();
	const {
		BannerMessage = DefaultBannerMessage,
		CarouselMessage = DefaultCarouselMessage,
		FullScreenMessage = DefaultFullScreenMessage,
	} = components;

	if (isNil(inAppMessage)) {
		return { Component: null, props: null };
	}

	const { content, layout } = inAppMessage;

	const onActionCallback = () => {
		InAppMessaging.notifyMessageInteraction(inAppMessage, InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN);
		clearInAppMessage();
	};

	const onClose = () => {
		InAppMessaging.notifyMessageInteraction(inAppMessage, InAppMessageInteractionEvent.MESSAGE_DISMISSED);
		clearInAppMessage();
	};

	const onDisplay = () => {
		InAppMessaging.notifyMessageInteraction(inAppMessage, InAppMessageInteractionEvent.MESSAGE_DISPLAYED);
	};

	switch (layout) {
		case 'BOTTOM_BANNER':
		case 'MIDDLE_BANNER':
		case 'TOP_BANNER': {
			const props: BannerMessageProps = {
				...getContentProps(content?.[0], onActionCallback),
				layout,
				onClose,
				onDisplay,
				position: getPositionProp(layout),
				style: style?.BannerMessage,
			};
			return { Component: BannerMessage, props };
		}
		case 'CAROUSEL': {
			const props: CarouselMessageProps = {
				data: content?.map((item) => getContentProps(item, onActionCallback)),
				layout,
				onClose,
				onDisplay,
				style: style?.CarouselMessage,
			};
			return { Component: CarouselMessage, props };
		}
		case 'OVERLAYS': {
			const props: FullScreenMessageProps = {
				...getContentProps(content?.[0], onActionCallback),
				layout,
				onClose,
				onDisplay,
				style: style?.FullScreenMessage,
			};
			return { Component: FullScreenMessage, props };
		}
		default: {
			logger.info(`Received unknown InAppMessage layout: ${layout}`);
			return { Component: null, props: null };
		}
	}
}
