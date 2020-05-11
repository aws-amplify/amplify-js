import * as React from 'react';
import { Picker } from '../../src/Widget/Picker';

describe('Picker test', () => {
	describe('render test', () => {
		test('render correcly', () => {
			const wrapper = shallow(<Picker />);

			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('interaction test', () => {
		test('chnage on input', () => {
			const spyon = jest
				.spyOn(Picker.prototype, 'handleInput')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<Picker />);

			wrapper
				.find('input')
				.at(0)
				.simulate('change', 'event');

			expect(spyon).toBeCalledWith('event');

			spyon.mockClear();
		});
	});

	describe('handleInput test', () => {
		test('happy case', () => {
			const onPickFn = jest.fn();

			const wrapper = shallow(<Picker />);
			const picker = wrapper.instance();
			wrapper.setProps({
				onPick: onPickFn,
			});

			const event = {
				target: {
					files: [
						{
							name: 'name',
							size: 'size',
							type: 'type',
						},
					],
				},
			};
			picker.handleInput(event);

			expect(onPickFn).toBeCalledWith({
				file: { name: 'name', size: 'size', type: 'type' },
				name: 'name',
				size: 'size',
				type: 'type',
			});
		});

		test('no onPick', () => {
			const wrapper = shallow(<Picker />);
			const picker = wrapper.instance();

			const event = {
				target: {
					files: [
						{
							name: 'name',
							size: 'size',
							type: 'type',
						},
					],
				},
			};
			picker.handleInput(event);
		});
	});
});
