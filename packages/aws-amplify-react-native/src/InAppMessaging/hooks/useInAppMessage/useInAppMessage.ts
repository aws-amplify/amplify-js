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
	BannerMessageProps,
	CarouselMessageProps,
	FullScreenMessageProps,
	InAppMessageComponents,
	useInAppMessaging,
} from '../..';

import { InAppMessageComponent, InAppMessageComponentProps } from './types';
import { getInAppMessage, getContentProps, getPositionProp } from './utils';

const logger = new Logger('Notifications.InAppMessaging');

// TODO: replace with Amplify default components
const DefaultBannerMessage: InAppMessageComponents['BannerMessage'] = () => null;
const DefaultCarouselMessage: InAppMessageComponents['CarouselMessage'] = () => null;
const DefaultFullScreenMessage: InAppMessageComponents['FullScreenMessage'] = () => null;

export default function useInAppMessage(): {
	Component: InAppMessageComponent;
	props: InAppMessageComponentProps;
} {
	const { clearInAppMessages, components, inAppMessages, style } = useInAppMessaging();
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
				...getContentProps(content?.[0], onActionCallback),
				id,
				onClose,
				position: getPositionProp(layout),
				style: style?.BannerMessage,
			};
			return { Component: BannerMessage, props };
		}
		case 'CAROUSEL': {
			const props: CarouselMessageProps = {
				data: content?.map((item) => getContentProps(item, onActionCallback)),
				id,
				onClose,
				style: style?.CarouselMessage,
			};
			return { Component: CarouselMessage, props };
		}
		case 'OVERLAYS': {
			const props: FullScreenMessageProps = {
				...getContentProps(content?.[0], onActionCallback),
				id,
				onClose,
				style: style?.FullScreenMessage,
			};
			return { Component: FullScreenMessage, props };
		}
		default: {
			logger.info(`Received unknown InAppMessage layout: ${layout}`);
			return { Component: null, props: {} as InAppMessageComponentProps };
		}
	}
}
