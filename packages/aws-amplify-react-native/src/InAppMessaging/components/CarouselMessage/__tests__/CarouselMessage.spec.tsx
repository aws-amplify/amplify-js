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

import React, { ReactElement } from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import { Carousel } from '../../../ui';
import CarouselMessage from '../CarouselMessage';

jest.mock('../../../ui', () => ({ Carousel: 'Carousel' }));
jest.mock('../../MessageWrapper', () => 'MessageWrapper');
jest.mock('../CarouselMessageItem', () => 'CarouselMessageItem');

const baseProps = { layout: 'CAROUSEL' as const, data: [] };

describe('CarouselMessage', () => {
	let carouselMessage: ReactTestRenderer;

	it('renders as expected', () => {
		act(() => {
			carouselMessage = create(<CarouselMessage {...baseProps} />);
		});

		expect(carouselMessage.toJSON()).toMatchSnapshot();
	});

	it('allows style overrides', () => {
		const overrides = {
			pageIndicatorActive: { backgroundColor: 'red' },
			pageIndicatorInactive: { backgroundColor: 'blue' },
		};
		act(() => {
			carouselMessage = create(<CarouselMessage {...baseProps} style={overrides} />);
		});

		expect(carouselMessage.toJSON()).toMatchSnapshot();
	});

	it('renders items', () => {
		let itemRenderer: ReactTestRenderer;
		act(() => {
			carouselMessage = create(<CarouselMessage {...baseProps} />);
		});
		const carousel = carouselMessage.root.findByType(Carousel);
		const item = (carousel.props as { renderItem: (data) => ReactElement }).renderItem({
			item: { image: { src: 'image-src' } },
		});
		act(() => {
			itemRenderer = create(item);
		});

		expect(itemRenderer.toJSON()).toMatchSnapshot();
	});
});
