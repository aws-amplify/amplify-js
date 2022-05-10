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
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import useDeviceOrientation from '../../hooks/useDeviceOrientation';
import useMessageImage from '../../hooks/useMessageImage';

import CarouselMessageItem from '../CarouselMessageItem';

jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('../../hooks/useDeviceOrientation');
jest.mock('../../hooks/useMessageImage');
jest.mock('../../MessageLayout', () => ({ MessageLayout: 'MessageLayout' }));
jest.mock('../../MessageWrapper', () => 'MessageWrapper');

const baseProps = { layout: 'CAROUSEL' as const };

describe('CarouselMessageItem', () => {
	let carouselMessageItem: ReactTestRenderer;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it.each(['landscape', 'portrait'])('renders as expected in %s mode', (orientation) => {
		(useDeviceOrientation as jest.Mock).mockReturnValue(orientation);
		(useMessageImage as jest.Mock).mockReturnValueOnce({
			hasRenderableImage: false,
			imageDimensions: { height: null, width: null },
			isImageFetching: false,
		});

		act(() => {
			carouselMessageItem = create(<CarouselMessageItem {...baseProps} />);
		});

		expect(carouselMessageItem.toJSON()).toMatchSnapshot();
	});

	it('returns null if message is not ready for rendering', () => {
		(useMessageImage as jest.Mock).mockReturnValueOnce({
			hasRenderableImage: false,
			imageDimensions: { height: null, width: null },
			isImageFetching: true,
		});
		act(() => {
			carouselMessageItem = create(<CarouselMessageItem {...baseProps} />);
		});

		expect(carouselMessageItem.toJSON()).toBeNull();
	});
});
