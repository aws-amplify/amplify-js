import * as React from 'react';
import { Tooltip } from '../../src/XR/Tooltip';

describe('Tooltip', () => {
	test('renders successfully with no props', () => {
		const wrapper = mount(<Tooltip />);
		expect(wrapper).toMatchSnapshot();
	});

	test('renders successfully with text', () => {
		const wrapper = mount(<Tooltip text="Test Tooltip" />);
		expect(wrapper).toMatchSnapshot();
	});
});
