import { PhoneField } from '../../src/Auth/PhoneField';
import * as React from 'react';
import AmplifyTheme from '../../src/AmplifyTheme';
import AuthPiece from '../../src/Auth/AuthPiece';
import { Input } from '../../src/Amplify-UI/Amplify-UI-Components-React';

describe('PhoneField', () => {
	test('render correctly', () => {
		const wrapper = shallow(<PhoneField />);
		expect(wrapper).toMatchSnapshot();
	});

	test('trigger handleInputChange if countryCode changed', () => {
		const wrapper = shallow(<PhoneField />);
		const mockOnChangeText = jest.fn();
		wrapper.setProps({
			onChangeText: mockOnChangeText,
		});

		const event = {
			target: {
				name: 'countryCode',
				value: '1',
			},
		};
		wrapper.find('select').at(0).simulate('change', event);
		expect(mockOnChangeText).toBeCalled();
	});

	test('trigger handleInputChange if phone line number changed', () => {
		const wrapper = shallow(<PhoneField />);
		const mockOnChangeText = jest.fn();
		wrapper.setProps({
			onChangeText: mockOnChangeText,
		});

		const event = {
			target: {
				name: 'phone_line_number',
				value: '1234567890',
			},
		};
		wrapper.find(Input).at(0).simulate('change', event);
		expect(mockOnChangeText).toBeCalled();
	});
});
