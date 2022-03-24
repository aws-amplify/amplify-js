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
import TestRenderer from 'react-test-renderer';

import { IN_APP_MESSAGING } from '../../../../AmplifyTestIDs';
import { MessageStyleProps } from '../../hooks/useMessageProps/types';

import FullScreenContent from '../FullScreenContent';

jest.mock('../../hooks/useMessageImage');
jest.mock('../../MessageWrapper', () => 'MessageWrapper');
jest.mock('../../../ui', () => ({
	Button: 'Button',
	IconButton: 'IconButton',
}));

const onClose = jest.fn();
const onPress = jest.fn();

const baseProps = {
	layout: 'FULL_SCREEN' as const,
	onClose,
	onPress,
	styles: { iconButton: {}, primaryButton: {}, secondaryButton: {} } as MessageStyleProps,
};

describe('FullScreenContent', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders a message as expected without an image', () => {
		const renderer = TestRenderer.create(<FullScreenContent {...baseProps} />);

		expect(renderer.toJSON()).toMatchSnapshot();
	});

	it('renders a message as expected with an image', () => {
		const src = 'asset.png';
		const props = { ...baseProps, image: { src }, hasRenderableImage: true };

		const renderer = TestRenderer.create(<FullScreenContent {...props} />);

		const image = renderer.root.findByProps({ testID: IN_APP_MESSAGING.IMAGE });

		expect(image.props).toEqual(expect.objectContaining({ source: { uri: src } }));
		expect(renderer.toJSON()).toMatchSnapshot();
	});

	it.each([
		['header', IN_APP_MESSAGING.HEADER, { content: 'header content' }, { children: 'header content' }, {}],
		['body', IN_APP_MESSAGING.BODY, { content: 'body content' }, { children: 'body content' }, {}],
		[
			'primaryButton',
			IN_APP_MESSAGING.PRIMARY_BUTTON,
			{ onPress, title: 'primary button' },
			{ children: 'primary button', onPress },
			{ hasButtons: true, hasPrimaryButton: true },
		],
		[
			'secondaryButton',
			IN_APP_MESSAGING.SECONDARY_BUTTON,
			{ onPress, title: 'secondary button' },
			{ children: 'secondary button', onPress },
			{ hasButtons: true, hasSecondaryButton: true },
		],
	])('correctly handles a %s prop', (key, testID, testProps, expectedProps, additionalProps) => {
		const props = { ...baseProps, [key]: testProps, ...additionalProps };

		const renderer = TestRenderer.create(<FullScreenContent {...props} />);
		const testElement = renderer.root.findByProps({ testID });

		expect(testElement.props).toEqual(expect.objectContaining(expectedProps));
	});

	it('calls onClose when the close button is pressed', () => {
		const renderer = TestRenderer.create(<FullScreenContent {...baseProps} />);
		const closeButton = renderer.root.findByProps({ testID: IN_APP_MESSAGING.CLOSE_BUTTON });

		TestRenderer.act(() => {
			(closeButton.props as { onPress: () => void }).onPress();
		});

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
