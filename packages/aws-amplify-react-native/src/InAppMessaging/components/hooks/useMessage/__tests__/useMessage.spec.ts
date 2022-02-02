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

import { InAppMessage, InAppMessageInteractionEvent, Notifications } from '@aws-amplify/notifications';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

import useInAppMessaging from '../../../../hooks/useInAppMessaging';
import BannerMessage from '../../../BannerMessage';
import CarouselMessage from '../../../CarouselMessage';
import FullScreenMessage from '../../../FullScreenMessage';
import ModalMessage from '../../../ModalMessage';
import { InAppMessageComponentBaseProps } from '../../../types';

import useMessage from '../useMessage';

jest.mock('@aws-amplify/notifications', () => ({
	...jest.requireActual('@aws-amplify/notifications'),
	Notifications: { InAppMessaging: { notifyMessageInteraction: jest.fn() } },
}));

jest.mock('../../../../hooks/useInAppMessaging', () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.useFakeTimers();

const logger = new Logger('TEST_LOGGER');

const mockUseInAppMessaging = useInAppMessaging as jest.Mock;
const mockClearInAppMessage = jest.fn();

const header = { content: 'header one' };
const baseInAppMessage: Partial<InAppMessage> = { id: 'test', content: [{ header }] };
const carouselInAppMessage: Partial<InAppMessage> = {
	id: 'carousel',
	content: [{ header }, { header: { content: 'header two' } }],
	layout: 'CAROUSEL',
};

function CustomBannerMessage() {
	return null;
}
function CustomCarouselMessage() {
	return null;
}
function CustomFullScreenMessage() {
	return null;
}
function CustomModalMessage() {
	return null;
}

describe('useMessage', () => {
	beforeEach(() => {
		(logger.info as jest.Mock).mockClear();
	});

	// happy path test for banner and full screen layouts
	it.each([
		['BOTTOM_BANNER', BannerMessage, { position: 'bottom' }],
		['FULL_SCREEN', FullScreenMessage, null],
		['MIDDLE_BANNER', BannerMessage, { position: 'middle' }],
		['TOP_BANNER', BannerMessage, { position: 'top' }],
		['MODAL', ModalMessage, null],
	])('returns the expected values of Component and props for a %s layout', (layout, layoutComponent, layoutProps) => {
		mockUseInAppMessaging.mockReturnValueOnce({ components: {}, inAppMessage: { ...baseInAppMessage, layout } });
		const { Component, props } = useMessage();

		expect(Component).toBe(layoutComponent);
		expect(props).toEqual(
			expect.objectContaining({
				...layoutProps,
				header,
				layout,
				onClose: expect.any(Function) as InAppMessageComponentBaseProps['onClose'],
				onDisplay: expect.any(Function) as InAppMessageComponentBaseProps['onDisplay'],
				style: undefined,
			})
		);
	});

	it('returns the expected values of Component and props for a CAROUSEL layout', () => {
		mockUseInAppMessaging.mockReturnValueOnce({ components: {}, inAppMessage: carouselInAppMessage });

		const { Component, props } = useMessage();

		expect(Component).toBe(CarouselMessage);
		expect(props).toEqual(
			expect.objectContaining({
				data: [{ header }, { header: { content: 'header two' } }],
				layout: 'CAROUSEL',
				onClose: expect.any(Function) as InAppMessageComponentBaseProps['onClose'],
				onDisplay: expect.any(Function) as InAppMessageComponentBaseProps['onDisplay'],
				style: undefined,
			})
		);
	});

	it.each([
		['BannerMessage', 'BOTTOM_BANNER', CustomBannerMessage],
		['BannerMessage', 'MIDDLE_BANNER', CustomBannerMessage],
		['BannerMessage', 'TOP_BANNER', CustomBannerMessage],
		['CarouselMessage', 'CAROUSEL', CustomCarouselMessage],
		['FullScreenMessage', 'FULL_SCREEN', CustomFullScreenMessage],
		['ModalMessage', 'MODAL', CustomModalMessage],
	])(
		'returns a custom %s component for a %s layout in place of the default component when provided',
		(componentKey, layout, CustomComponent) => {
			mockUseInAppMessaging.mockReturnValueOnce({
				components: { [componentKey]: CustomComponent },
				inAppMessage: { layout },
			});

			const { Component } = useMessage();

			expect(Component).toBe(CustomComponent);
		}
	);

	it('returns null values for Component and props when inAppMessage is null', () => {
		mockUseInAppMessaging.mockReturnValueOnce({ components: {}, inAppMessage: null });

		const { Component, props } = useMessage();

		expect(Component).toBeNull();
		expect(props).toBeNull();
	});

	it('returns null values for Component and props when inAppMessage.layout is not supported', () => {
		const layout = 'NOT_A_SUPPORTED_LAYOUT';
		mockUseInAppMessaging.mockReturnValueOnce({
			components: {},
			inAppMessage: { layout },
		});

		const { Component, props } = useMessage();

		expect(logger.info).toHaveBeenCalledWith(`Received unknown InAppMessage layout: ${layout}`);
		expect(logger.info).toHaveBeenCalledTimes(1);
		expect(Component).toBeNull();
		expect(props).toBeNull();
	});

	describe('event handling', () => {
		const inAppMessage = {
			content: [{ primaryButton: { action: 'CLOSE', title: 'primary' } }],
			layout: 'TOP_BANNER',
		};

		beforeEach(() => {
			mockUseInAppMessaging.mockReturnValueOnce({
				clearInAppMessage: mockClearInAppMessage,
				components: {},
				inAppMessage,
			});

			mockClearInAppMessage.mockClear();
			(Notifications.InAppMessaging.notifyMessageInteraction as jest.Mock).mockClear();
		});

		describe('onClose', () => {
			it('calls the expected methods', () => {
				const { props } = useMessage();

				props.onClose();

				expect(Notifications.InAppMessaging.notifyMessageInteraction).toHaveBeenCalledTimes(1);
				expect(Notifications.InAppMessaging.notifyMessageInteraction).toHaveBeenCalledWith(
					inAppMessage,
					InAppMessageInteractionEvent.MESSAGE_DISMISSED
				);
				expect(mockClearInAppMessage).toHaveBeenCalledTimes(1);
			});
		});

		describe('onDisplay', () => {
			it('calls the expected methods', () => {
				const { props } = useMessage();

				props.onDisplay();

				expect(Notifications.InAppMessaging.notifyMessageInteraction).toHaveBeenCalledTimes(1);
				expect(Notifications.InAppMessaging.notifyMessageInteraction).toHaveBeenCalledWith(
					inAppMessage,
					InAppMessageInteractionEvent.MESSAGE_DISPLAYED
				);
			});
		});

		describe('onActionCallback', () => {
			it('calls the expected methods via the onPress function of the primary button', () => {
				const { props } = useMessage();

				props.primaryButton.onPress();

				jest.runAllTimers();

				expect(Notifications.InAppMessaging.notifyMessageInteraction).toHaveBeenCalledTimes(1);
				expect(Notifications.InAppMessaging.notifyMessageInteraction).toHaveBeenCalledWith(
					inAppMessage,
					InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN
				);
				expect(mockClearInAppMessage).toHaveBeenCalledTimes(1);
			});
		});
	});
});
