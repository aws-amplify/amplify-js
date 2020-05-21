import * as React from 'react';
import { Loading } from '../../src/XR/Loading';

describe('Loading', () => {
	test('renders successfully with no props', () => {
		const wrapper = mount(<Loading />);
		expect(wrapper).toMatchSnapshot();
	});

	test('renders successfully with percentage', () => {
		const wrapper = mount(<Loading percentage="0" />);
		expect(wrapper).toMatchSnapshot();
	});
});
