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
import TestRenderer, { ReactTestRenderer } from 'react-test-renderer';
import { Notifications } from '@aws-amplify/notifications';

import useInAppMessaging from '../../hooks/useInAppMessaging';
import { InAppMessagingContextType } from '../types';
import InAppMessagingProvider from '../InAppMessagingProvider';

jest.mock('@aws-amplify/notifications', () => ({
	...jest.requireActual('@aws-amplify/notifications'),
	Notifications: { InAppMessaging: { onMessageReceived: jest.fn() } },
}));

const { InAppMessaging } = Notifications;

let onMessageReceivedCallback: InAppMessagingContextType['displayInAppMessage'] = null;

const mockRemove = jest.fn(() => {
	onMessageReceivedCallback = null;
});

const mockOnMessageReceived = (callback: InAppMessagingContextType['displayInAppMessage']) => {
	onMessageReceivedCallback = callback;
	return { remove: mockRemove };
};

const ChildComponent = (_) => <></>;
const TestComponent = () => {
	const props = useInAppMessaging();
	return <ChildComponent {...props} />;
};

const message = { layout: 'TOP_BANNER' as const, id: '0', content: [] };

describe('InAppMessagingProvider', () => {
	let renderer: ReactTestRenderer;

	beforeEach(() => {
		jest.resetAllMocks();

		(InAppMessaging.onMessageReceived as jest.Mock).mockImplementation(mockOnMessageReceived);

		TestRenderer.act(() => {
			renderer = TestRenderer.create(
				<InAppMessagingProvider>
					<TestComponent />
				</InAppMessagingProvider>
			);
		});
	});

	it('vends the expected initial context values', () => {
		const expectedProps = {
			clearInAppMessage: expect.any(Function) as InAppMessagingContextType['clearInAppMessage'],
			components: {},
			displayInAppMessage: expect.any(Function) as InAppMessagingContextType['displayInAppMessage'],
			inAppMessage: null,
			style: {},
		};

		expect(renderer.root.findByType(ChildComponent).props).toEqual(expectedProps);
	});

	it('registers a listener to InAppMessaging.onMessageReceived as expected', () => {
		expect(InAppMessaging.onMessageReceived).toBeCalledTimes(1);
		expect(InAppMessaging.onMessageReceived).toBeCalledWith(
			expect.any(Function) as InAppMessagingContextType['displayInAppMessage']
		);
	});

	it('updates the value of inAppMessage when the listener registered to InAppMessaging.onMessageReceived is called', () => {
		TestRenderer.act(() => {
			onMessageReceivedCallback(message);
		});

		const consumer = renderer.root.findByType(ChildComponent);

		expect((consumer.props as InAppMessagingContextType).inAppMessage).toStrictEqual(message);
	});

	it('removes the listener registered to InAppMessaging.onMessageReceived as expected', () => {
		TestRenderer.act(() => {
			renderer.unmount();
		});

		expect(mockRemove).toBeCalledTimes(1);
	});

	it('updates the value of inAppMessage when displayInAppMessage is called', () => {
		const consumer = renderer.root.findByType(ChildComponent);

		TestRenderer.act(() => {
			(consumer.props.displayInAppMessage as InAppMessagingContextType['displayInAppMessage'])(message);
		});

		expect((consumer.props as InAppMessagingContextType).inAppMessage).toStrictEqual(message);
	});

	it('updates the value of inAppMessage when clearInAppMessage is called', () => {
		const consumer = renderer.root.findByType(ChildComponent);

		TestRenderer.act(() => {
			(consumer.props as InAppMessagingContextType).displayInAppMessage(message);
		});

		expect(consumer.props.inAppMessage).not.toBeNull();

		TestRenderer.act(() => {
			(consumer.props as InAppMessagingContextType).clearInAppMessage();
		});

		expect(consumer.props.inAppMessage).toBeNull();
	});

	it('vends custom components received as props', () => {
		function BannerMessage(_) {
			return null;
		}

		renderer.update(
			<InAppMessagingProvider components={{ BannerMessage }}>
				<TestComponent />
			</InAppMessagingProvider>
		);

		const consumer = renderer.root.findByType(ChildComponent);

		expect((consumer.props as InAppMessagingContextType).components.BannerMessage).toBe(BannerMessage);
	});

	it('vends custom style received as props', () => {
		const style = { BannerMessage: { container: { backgroundColor: 'lavenderblush' } } };

		renderer.update(
			<InAppMessagingProvider style={style}>
				<TestComponent />
			</InAppMessagingProvider>
		);

		const consumer = renderer.root.findByType(ChildComponent);

		expect((consumer.props as InAppMessagingContextType).style).toBe(style);
	});
});
