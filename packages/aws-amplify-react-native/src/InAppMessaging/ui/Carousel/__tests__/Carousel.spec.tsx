import React from 'react';
import { Dimensions, FlatList, ListRenderItem, Text, ViewToken } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import Carousel from '../Carousel';
import CarouselPageIndicator from '../CarouselPageIndicator';

jest.mock('../CarouselPageIndicator', () => 'CarouselPageIndicator');

type ItemProps = { str?: string };

const Item = ({ str }: ItemProps) => <Text>{str}</Text>;
const renderItem: ListRenderItem<ItemProps> = ({ item }) => <Item str={item.str} />;

describe('Carousel', () => {
	let carousel: ReactTestRenderer;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders with multiple items in the data', () => {
		const data = [
			{ key: 1, str: 'foo' },
			{ key: 2, str: 'bar' },
		];
		act(() => {
			carousel = create(<Carousel data={data} renderItem={renderItem} />);
		});
		const instance = carousel.root;

		expect(carousel.toJSON()).toMatchSnapshot();
		expect(instance.findAllByType(Text)).toHaveLength(2);
		expect(instance.findByType(CarouselPageIndicator).props.numberOfItems).toBe(2);
	});

	it('renders with just one item in the data', () => {
		const data = [{ key: 1, str: 'qux' }];
		act(() => {
			carousel = create(<Carousel data={data} renderItem={renderItem} />);
		});
		const instance = carousel.root;

		expect(carousel.toJSON()).toMatchSnapshot();
		expect(instance.findAllByType(Text)).toHaveLength(1);
		expect(instance.findByType(CarouselPageIndicator).props.numberOfItems).toBe(1);
	});

	it('returns null if data is null', () => {
		// Ideally, this should not happen but, if it does, we should be able to handle gracefully
		act(() => {
			carousel = create(<Carousel data={null} renderItem={renderItem} />);
		});

		expect(carousel.toJSON()).toBeNull();
	});

	it('returns null if there are no items in the data', () => {
		// Ideally, this should not happen but, if it does, we should be able to handle gracefully
		act(() => {
			carousel = create(<Carousel data={[]} renderItem={renderItem} />);
		});

		expect(carousel.toJSON()).toBeNull();
	});

	it('calls the orientation handler on orientation change', () => {
		let orientationHandler: Function;
		const data = [{ key: 1, str: 'qux' }];
		const window = { width: 350 };
		const addEventListenerSpy = jest.spyOn(Dimensions, 'addEventListener');
		// Get a reference to the orientation handler by spying on the `addEventListener` call
		addEventListenerSpy.mockImplementation((_, handler) => {
			orientationHandler = handler;
		});
		act(() => {
			carousel = create(<Carousel data={data} renderItem={renderItem} />);
		});
		const instance = carousel.root;

		expect(instance.findByType(Text).parent.parent.props.style).not.toStrictEqual(window);

		// Call the orientation handler with an arbitrary `ScaledSize`
		act(() => {
			orientationHandler({ window });
		});

		expect(instance.findByType(Text).parent.parent.props.style).toStrictEqual(window);
	});

	it('cleans up the orientation change listener', () => {
		const removeEventListener = jest.spyOn(Dimensions, 'removeEventListener');
		act(() => {
			carousel = create(<Carousel data={null} renderItem={renderItem} />);
		});
		act(() => {
			carousel.unmount();
		});
		expect(removeEventListener).toBeCalled();
	});

	it('cleans up the orientation change listener (React Native v0.65+)', () => {
		const mockSubscription = { remove: jest.fn() };
		const addEventListenerSpy = jest.spyOn(Dimensions, 'addEventListener');
		(addEventListenerSpy as jest.Mock).mockReturnValue(mockSubscription);
		act(() => {
			carousel = create(<Carousel data={null} renderItem={renderItem} />);
		});
		act(() => {
			carousel.unmount();
		});
		expect(mockSubscription.remove).toBeCalled();
	});

	it('sets the index when viewable items change', () => {
		const data = [
			{ key: 1, str: 'foo' },
			{ key: 2, str: 'bar' },
		];
		act(() => {
			carousel = create(<Carousel data={data} renderItem={renderItem} />);
		});
		const instance = carousel.root;
		const flatList = instance.findByType(FlatList);
		const { onViewableItemsChanged } = flatList.props as FlatList['props'];

		expect(instance.findByType(CarouselPageIndicator).props.currentIndex).toBe(0);

		act(() => {
			const info = { viewableItems: [{ index: 1 } as ViewToken], changed: [] };
			onViewableItemsChanged(info);
		});

		expect(instance.findByType(CarouselPageIndicator).props.currentIndex).toBe(1);

		// should not update the index if `viewableItems` is empty
		act(() => {
			const info = { viewableItems: [], changed: [] };
			onViewableItemsChanged(info);
		});

		expect(instance.findByType(CarouselPageIndicator).props.currentIndex).toBe(1);
	});
});
