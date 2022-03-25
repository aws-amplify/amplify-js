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
import useMessageImage from '../../hooks/useMessageImage';
import { INITIAL_IMAGE_DIMENSIONS } from '../../hooks/useMessageImage/constants';

import ModalMessage from '../ModalMessage';

jest.mock('../../hooks/useMessageImage', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('../../MessageWrapper', () => 'MessageWrapper');

const mockUseMessageImage = useMessageImage as jest.Mock;
const onClose = jest.fn();
const onPress = jest.fn();

const baseProps = { layout: 'MODAL' as const, onClose };

describe('ModalMessage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders a message as expected without an image', () => {
		mockUseMessageImage.mockReturnValueOnce({
			hasRenderableImage: false,
			imageDimensions: INITIAL_IMAGE_DIMENSIONS,
			isImageFetching: false,
		});

		const renderer = TestRenderer.create(<ModalMessage {...baseProps} />);

		expect(renderer.toJSON()).toMatchSnapshot();
	});

	it('renders a message as expected with an image', () => {
		mockUseMessageImage.mockReturnValueOnce({
			hasRenderableImage: true,
			imageDimensions: { height: 100, width: 100 },
			isImageFetching: false,
		});

		const src = 'asset.png';
		const props = { ...baseProps, image: { src } };

		const renderer = TestRenderer.create(<ModalMessage {...props} />);

		const image = renderer.root.findByProps({ testID: IN_APP_MESSAGING.IMAGE });

		expect(image.props).toEqual(expect.objectContaining({ source: { uri: src } }));
		expect(renderer.toJSON()).toMatchSnapshot();
	});

	it('returns null while an image is fetching', () => {
		mockUseMessageImage.mockReturnValueOnce({
			hasRenderableImage: false,
			imageDimensions: INITIAL_IMAGE_DIMENSIONS,
			isImageFetching: true,
		});

		const renderer = TestRenderer.create(<ModalMessage {...baseProps} />);

		expect(renderer.toJSON()).toBeNull();
	});

	it.each([
		['header', IN_APP_MESSAGING.HEADER, { content: 'header content' }, { children: 'header content' }],
		['body', IN_APP_MESSAGING.BODY, { content: 'body content' }, { children: 'body content' }],
		[
			'primaryButton',
			IN_APP_MESSAGING.PRIMARY_BUTTON,
			{ onPress, title: 'primary button' },
			{ children: 'primary button', onPress },
		],
		[
			'secondaryButton',
			IN_APP_MESSAGING.SECONDARY_BUTTON,
			{ onPress, title: 'secondary button' },
			{ children: 'secondary button', onPress },
		],
	])('correctly handles a %s prop', (key, testID, testProps, expectedProps) => {
		mockUseMessageImage.mockReturnValueOnce({
			hasRenderableImage: false,
			imageDimensions: INITIAL_IMAGE_DIMENSIONS,
			isImageFetching: false,
		});

		const props = { ...baseProps, [key]: testProps };

		const renderer = TestRenderer.create(<ModalMessage {...props} />);
		const testElement = renderer.root.findByProps({ testID });

		expect(testElement.props).toEqual(expect.objectContaining(expectedProps));
	});

	it('calls onClose when the close button is pressed', () => {
		mockUseMessageImage.mockReturnValueOnce({
			hasRenderableImage: false,
			imageDimensions: INITIAL_IMAGE_DIMENSIONS,
			isImageFetching: false,
		});

		const renderer = TestRenderer.create(<ModalMessage {...baseProps} />);
		const closeButton = renderer.root.findByProps({ testID: IN_APP_MESSAGING.CLOSE_BUTTON });

		TestRenderer.act(() => {
			(closeButton.props as { onPress: () => void }).onPress();
		});

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
