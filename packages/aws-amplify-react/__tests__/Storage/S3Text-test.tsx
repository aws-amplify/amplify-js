import * as React from 'react';
import { Storage } from '@aws-amplify/storage';
import { S3Text } from '../../src/Storage/S3Text';
import { TextPicker } from '../../src/Widget';

jest.mock('../../src/Storage/Common', () => {
	const calcKey = () => {
		return '';
	};

	return { calcKey };
});

describe('S3Text test', () => {
	describe('render test', () => {
		test('render null if no test and no picker', () => {
			const wrapper = shallow(<S3Text />);

			expect(wrapper).toMatchSnapshot();
		});

		test('render with picker true', () => {
			const wrapper = shallow(<S3Text picker />);

			expect(wrapper).toMatchSnapshot();
		});

		test('render with text exist', () => {
			const wrapper = shallow(<S3Text />);
			wrapper.setState({ text: 'text' });

			expect(wrapper).toMatchSnapshot();
		});

		test('render with translate text', () => {
			const wrapper = shallow(<S3Text translate="translate" />);

			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('interaction test', () => {
		test('TextPicker onPick test', () => {
			const spyon = jest
				.spyOn(S3Text.prototype, 'handlePick')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<S3Text picker />);

			wrapper.find(TextPicker).simulate('pick');

			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('textEl click test', () => {
			const spyon = jest
				.spyOn(S3Text.prototype, 'handleClick')
				.mockImplementationOnce(() => {
					return;
				});
			const wrapper = shallow(<S3Text />);
			wrapper.setState({ text: 'text' });

			wrapper
				.find('div')
				.at(1)
				.simulate('click');

			expect(spyon).toBeCalled();

			spyon.mockClear();
		});
	});

	describe('load test', () => {
		test('happy case with body set', async () => {
			const spyon = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('text');
				});
			});
			const spyon2 = jest
				.spyOn(S3Text.prototype, 'getText')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();
			wrapper.setProps({
				textKey: 'textKey',
				body: 'textBody',
			});

			await s3Text.load();

			expect.assertions(2);
			expect(spyon).toBeCalledWith('textKey', 'textBody', {
				contentType: 'text/*',
				level: 'public',
			});
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('nothing to do if no textKey and path set', async () => {
			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();

			await s3Text.load();
		});

		test('only get text when body no specified', async () => {
			const spyon = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('text');
				});
			});
			const spyon2 = jest
				.spyOn(S3Text.prototype, 'getText')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();
			wrapper.setProps({
				textKey: 'textKey',
			});

			await s3Text.load();

			expect.assertions(2);
			expect(spyon).not.toBeCalled();
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});
	});

	describe('handlePick test', () => {
		test('happy case', async () => {
			const spyon = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('data');
				});
			});

			const spyon2 = jest
				.spyOn(S3Text.prototype, 'getText')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();
			wrapper.setProps({
				text: 'text',
				textKey: 'textKey',
				level: 'level',
				fileToKey: 'fileToKey',
			});

			const data = {
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			};

			await s3Text.handlePick(data);

			expect.assertions(2);
			expect(spyon).toBeCalledWith('textKey', 'file', {
				contentType: 'type',
				level: 'level',
				track: undefined,
			});
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('storage put error', async () => {
			const spyon = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});

			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();
			wrapper.setProps({
				text: 'text',
				textKey: 'textKey',
				level: 'level',
				fileToKey: 'fileToKey',
			});

			const data = {
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			};

			await s3Text.handlePick(data);

			spyon.mockClear();
		});
	});

	describe('handleClick test', () => {
		test('happy case', () => {
			const mockFn = jest.fn();
			const props = {
				text: 'text',
				textKey: 'textKey',
				onClick: mockFn,
			};

			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();
			wrapper.setProps(props);

			s3Text.handleClick('evt');

			expect(mockFn).toBeCalledWith('evt');
		});

		test('if no onclick', () => {
			const mockFn = jest.fn();
			const props = {
				text: 'text',
				textKey: 'textKey',
			};
			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();
			wrapper.setProps(props);

			s3Text.handleClick('evt');
		});
	});

	describe('handleOnLoad test', () => {
		test('happy case', () => {
			const mockFn = jest.fn();
			const props = {
				text: 'text',
				textKey: 'textKey',
				onLoad: mockFn,
			};
			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();
			wrapper.setProps(props);

			s3Text.handleOnLoad('text');

			expect(mockFn).toBeCalledWith('text');
		});

		test('if no onLoad', () => {
			const mockFn = jest.fn();
			const props = {
				text: 'text',
				textKey: 'textKey',
			};
			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();
			wrapper.setProps(props);

			s3Text.handleOnLoad('evt');
		});
	});

	describe('handleOnError test', () => {
		test('happy case', () => {
			const mockFn = jest.fn();
			const props = {
				text: 'text',
				textKey: 'textKey',
				onError: mockFn,
			};
			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();
			wrapper.setProps(props);

			s3Text.handleOnError('err');

			expect(mockFn).toBeCalledWith('err');
		});
	});

	describe('textEl test', () => {
		test('null text', () => {
			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();

			expect(s3Text.textEl(null, 'theme')).toBeNull();
		});
	});

	describe('componentDidmount test', () => {
		test('happy case', () => {
			const spyon = jest.spyOn(S3Text.prototype, 'load');

			const wrapper = mount(<S3Text />);

			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('getText test', () => {
		test('happy case', () => {
			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();

			const spyon = jest.spyOn(Storage, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('url');
				});
			});

			s3Text.getText('key', 'level', false, 'identityId');
			expect(spyon).toBeCalledWith('key', {
				download: true,
				level: 'level',
				track: false,
				identityId: 'identityId',
			});
			spyon.mockClear();
		});

		test('error case', () => {
			const wrapper = shallow(<S3Text />);
			const s3Text = wrapper.instance();

			const spyon = jest.spyOn(Storage, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});

			try {
				s3Text.getText('key', 'level', false);
			} catch (e) {
				expect(e).not.toBeNull();
			}

			spyon.mockClear();
		});
	});
});
