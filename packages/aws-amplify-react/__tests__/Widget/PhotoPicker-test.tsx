import * as React from 'react';
import { PhotoPicker } from '../../src/Widget/PhotoPicker';
import { Picker } from '../../src/Widget/Picker';

describe('PhotoPicker test', () => {
	describe('render test', () => {
		test('render with previewSrc', () => {
			const wrapper = shallow(<PhotoPicker />);

			wrapper.setState({ previewSrc: true });

			expect(wrapper).toMatchSnapshot();
		});

		test('render without previewSrc', () => {
			const wrapper = shallow(<PhotoPicker />);

			wrapper.setState({ previewSrc: false });

			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('interaction test', () => {
		test('Picker pick test', () => {
			const spyon = jest
				.spyOn(PhotoPicker.prototype, 'handlePick')
				.mockImplementationOnce(() => {
					return;
				});
			const wrapper = shallow(<PhotoPicker />);

			wrapper.find(Picker).simulate('pick');

			expect(spyon).toBeCalled();
		});
	});

	describe('hanldePick test', () => {
		test('happy case', () => {
			const spyon = jest
				.spyOn(FileReader.prototype, 'readAsDataURL')
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
			const wrapper = shallow(<PhotoPicker />);
			const photoPicker = wrapper.instance();
			wrapper.setProps(props);

			photoPicker.handlePick(data);

			expect(onPickFn).toBeCalled();
			expect(spyon).toBeCalledWith('file');

			spyon.mockClear();
		});

		test('with no onPick and no preview', () => {
			const spyon = jest
				.spyOn(FileReader.prototype, 'readAsDataURL')
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
			const wrapper = shallow(<PhotoPicker />);
			const photoPicker = wrapper.instance();

			wrapper.setProps({
				preview: false,
				onLoad: onLoadFn,
			});
			photoPicker.handlePick(data);
			expect(spyon).not.toBeCalledWith('file');

			wrapper.setProps({
				preview: 'hidden',
				onLoad: onLoadFn,
			});
			photoPicker.handlePick(data);
			expect(spyon).not.toBeCalledWith('file');

			wrapper.setProps({
				preview: undefined,
				onLoad: onLoadFn,
			});
			photoPicker.handlePick(data);
			expect(spyon).not.toBeCalledWith('file');

			spyon.mockClear();
		});
	});
});
