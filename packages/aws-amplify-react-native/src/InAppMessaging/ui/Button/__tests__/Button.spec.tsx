import React from 'react';
import { Text } from 'react-native';
import TestRenderer from 'react-test-renderer';

import Button from '../Button';

const title = 'A preesable button';
const Title = () => <Text>{title}</Text>;

describe('Button', () => {
	it('renders as expected with a string passed as children', () => {
		const button = TestRenderer.create(<Button>{title}</Button>);
		expect(button.toJSON()).toMatchSnapshot();
	});

	it('renders as expected with a component passed as children', () => {
		const button = TestRenderer.create(
			<Button>
				<Title />
			</Button>
		);
		expect(button.toJSON()).toMatchSnapshot();
	});
});
