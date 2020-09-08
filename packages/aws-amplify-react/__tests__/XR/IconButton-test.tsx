import * as React from 'react';
import { IconButton } from '../../src/XR/IconButton';

describe('IconButton', () => {
	test('renders successfully with no variant', () => {
		const wrapper = mount(<IconButton />);
		expect(wrapper).toMatchSnapshot();
	});

	test('renders successfully with variant', () => {
		const wrapper = mount(<IconButton variant="maximize" />);
		expect(wrapper).toMatchSnapshot();
	});
});
