import React from 'react';
import { View } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import CarouselPageIndicator from '../CarouselPageIndicator';

jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));

describe('CarouselPageIndicator', () => {
	let carouselPageIndicator: ReactTestRenderer;

	it('renders with multiple items', () => {
		act(() => {
			carouselPageIndicator = create(<CarouselPageIndicator currentIndex={0} numberOfItems={3} />);
		});
		const instance = carouselPageIndicator.root;

		expect(carouselPageIndicator.toJSON()).toMatchSnapshot();
		expect(instance.findAllByType(View)).toHaveLength(3);
	});

	it('renders with just one item', () => {
		act(() => {
			carouselPageIndicator = create(<CarouselPageIndicator currentIndex={0} numberOfItems={1} />);
		});
		const instance = carouselPageIndicator.root;

		expect(carouselPageIndicator.toJSON()).toMatchSnapshot();
		expect(instance.findAllByType(View)).toHaveLength(1);
	});

	it('handles null numberOfItems value', () => {
		// Ideally, this should not happen but, if it does, we should be able to handle gracefully
		act(() => {
			carouselPageIndicator = create(<CarouselPageIndicator currentIndex={0} numberOfItems={null} />);
		});

		expect(carouselPageIndicator.toJSON()).toMatchSnapshot();
	});

	it('renders indicator styles based on current index', () => {
		act(() => {
			carouselPageIndicator = create(<CarouselPageIndicator currentIndex={1} numberOfItems={3} />);
		});
		const instance = carouselPageIndicator.root;
		const indicators = instance.findAllByType(View);
		const activeIndicator = indicators[1];

		expect(carouselPageIndicator.toJSON()).toMatchSnapshot();
		expect(indicators[0].props).toStrictEqual(indicators[2].props);
		expect(indicators[0].props).not.toStrictEqual(activeIndicator.props);
		expect(indicators[2].props).not.toStrictEqual(activeIndicator.props);
	});

	it('handles null index value', () => {
		// Ideally, this should not happen but, if it does, we should be able to handle gracefully
		act(() => {
			carouselPageIndicator = create(<CarouselPageIndicator currentIndex={null} numberOfItems={5} />);
		});

		expect(carouselPageIndicator.toJSON()).toMatchSnapshot();
	});
});
