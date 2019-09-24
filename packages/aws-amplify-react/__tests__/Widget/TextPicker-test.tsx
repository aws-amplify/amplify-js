import * as React from 'react';
import { TextPicker } from '../../src/Widget/TextPicker';
import { Picker } from '../../src/Widget/Picker';

describe('TextPicker test', () => {
	describe('render test', () => {
		test('render with previewSrc', () => {
			const wrapper = shallow(<TextPicker />);

			wrapper.setState({ previewText: true });

			expect(wrapper).toMatchSnapshot();
		});

		test('render without previewText', () => {
			const wrapper = shallow(<TextPicker />);

			wrapper.setState({ previewText: false });

			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('interaction test', () => {
		test('Picker pick test', () => {
			const spyon = jest
				.spyOn(TextPicker.prototype, 'handlePick')
				.mockImplementationOnce(() => {
					return;
				});
			const wrapper = shallow(<TextPicker />);

			wrapper.find(Picker).simulate('pick');

			expect(spyon).toBeCalled();
		});
	});

	describe('hanldePick test', () => {
		test('happy case', () => {
			const spyon = jest
				.spyOn(FileReader.prototype, 'readAsText')
				.mockImplementationOnce(() => {
					return;
				});
			const onPickFn = jest.fn();
			const onLoadFn = jest.fn();

			const data = {
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			};
			const props = {
				preview: true,
				onPick: onPickFn,
				onLoad: onLoadFn,
			};
			const wrapper = shallow(<TextPicker />);
			const textPicker = wrapper.instance();
			wrapper.setProps(props);

			textPicker.handlePick(data);

			expect(onPickFn).toBeCalled();
			expect(spyon).toBeCalledWith('file');

			spyon.mockClear();
		});

		test('with no onPick and no preview', () => {
			const spyon = jest
				.spyOn(FileReader.prototype, 'readAsText')
				.mockImplementationOnce(() => {
					return;
				});

			const onLoadFn = jest.fn();

			const data = {
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			};
			const props = {
				preview: false,
				onLoad: onLoadFn,
			};
			const wrapper = shallow(<TextPicker />);
			const textPicker = wrapper.instance();
			wrapper.setProps(props);

			textPicker.handlePick(data);

			expect(spyon).not.toBeCalledWith('file');

			spyon.mockClear();
		});
	});
});
