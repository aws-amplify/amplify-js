import * as React from 'react';
import { Storage } from '@aws-amplify/storage';
import { S3Image } from '../../src/Storage/S3Image';
import { PhotoPicker } from '../../src/Widget';

jest.mock('../../src/Storage/Common', () => {
	const calcKey = () => {
		return '';
	};

	return { calcKey };
});

jest.mock('@aws-sdk/client-s3', () => ({
	S3Client: jest.fn().mockImplementation(() => ({
		send: jest.fn(),
		middlewareStack: {
			add: jest.fn(),
			remove: jest.fn(),
		},
		config: jest.fn(),
	})),
}));

describe('S3Image', () => {
	describe('render test', () => {
		test('render null if no test and no picker', () => {
			const wrapper = shallow(<S3Image />);

			expect(wrapper).toMatchSnapshot();
		});

		test('render with className', () => {
			const wrapper = shallow(<S3Image className="shadow" />);

			expect(wrapper).toMatchSnapshot();
		});

		test('render with picker true', () => {
			const wrapper = shallow(<S3Image picker />);

			expect(wrapper).toMatchSnapshot();
		});

		test('render with src exist', () => {
			const wrapper = shallow(<S3Image />);
			wrapper.setState({ src: 'imageSrc' });

			expect(wrapper).toMatchSnapshot();
		});

		test('render with translate text', () => {
			const wrapper = shallow(<S3Image translate="translate" />);

			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('interaction test', () => {
		test('PhotoPicker onPick test', () => {
			const spyon = jest
				.spyOn(S3Image.prototype, 'handlePick')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<S3Image picker />);

			wrapper.find(PhotoPicker).simulate('pick');

			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('imageEl click test', () => {
			const spyon = jest
				.spyOn(S3Image.prototype, 'handleClick')
				.mockImplementationOnce(() => {
					return;
				});
			const wrapper = shallow(<S3Image />);
			wrapper.setState({ src: 'imageSrc' });

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
					res('data');
				});
			});

			const spyon2 = jest
				.spyOn(S3Image.prototype, 'getImageSource')
				.mockImplementationOnce(() => {
					return;
				});

			const props = {
				imgKey: 'imgKey',
				body: 'imgBody',
			};

			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();
			wrapper.setProps(props);

			await s3Image.load();

			expect.assertions(2);
			expect(spyon).toBeCalledWith('imgKey', 'imgBody', {
				contentType: 'binary/octet-stream',
				level: 'public',
			});
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('nothing to do if no imgKey and path set', async () => {
			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();

			await s3Image.load();
		});

		test('only get image source when body no specified', async () => {
			const spyon = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('text');
				});
			});

			const spyon2 = jest
				.spyOn(S3Image.prototype, 'getImageSource')
				.mockImplementationOnce(() => {
					return;
				});

			const props = {
				imgKey: 'imgKey',
			};

			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();
			wrapper.setProps(props);

			await s3Image.load();

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
				.spyOn(S3Image.prototype, 'getImageSource')
				.mockImplementationOnce(() => {
					return;
				});

			const mockOnUploadSuccess = jest.fn();
			const wrapper = shallow(
				<S3Image onUploadSuccess={mockOnUploadSuccess} />
			);
			const s3Image = wrapper.instance();
			wrapper.setProps({
				imgKey: 'imgKey',
				level: 'level',
				fileToKey: 'fileToKey',
			});

			const data = {
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			};

			await s3Image.handlePick(data);

			expect.assertions(3);
			expect(spyon).toBeCalledWith('imgKey', 'file', {
				contentType: 'type',
				level: 'level',
				track: undefined,
			});
			expect(mockOnUploadSuccess).toBeCalled();
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

			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();
			wrapper.setProps({
				imgKey: 'imgKey',
				level: 'level',
				fileToKey: 'fileToKey',
			});

			const data = {
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			};

			await s3Image.handlePick(data);

			spyon.mockClear();
		});
	});

	describe('handleClick test', () => {
		test('happy case', () => {
			const mockFn = jest.fn();
			const props = {
				onClick: mockFn,
			};

			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();
			wrapper.setProps(props);

			s3Image.handleClick('evt');

			expect(mockFn).toBeCalledWith('evt');
		});

		test('if no onclick', () => {
			const mockFn = jest.fn();

			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();

			s3Image.handleClick('evt');
		});
	});

	describe('handleOnLoad test', () => {
		test('happy case', () => {
			const mockFn = jest.fn();
			const props = {
				onLoad: mockFn,
			};
			const state = {
				src: 'src',
			};
			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();
			wrapper.setProps(props);
			wrapper.setState(state);

			s3Image.handleOnLoad('img');

			expect(mockFn).toBeCalledWith('src');
		});

		test('if no onLoad', () => {
			const mockFn = jest.fn();

			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();

			s3Image.handleOnLoad('evt');
		});
	});

	describe('handleOnError test', () => {
		test('happy case', () => {
			const mockFn = jest.fn();
			const props = {
				onError: mockFn,
			};
			const state = {
				src: 'src',
			};
			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();
			wrapper.setProps(props);
			wrapper.setState(state);

			s3Image.handleOnError('err');

			expect(mockFn).toBeCalledWith('src');
		});
	});

	describe('ImageEl test', () => {
		test('null text', () => {
			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();

			expect(s3Image.imageEl(null, 'theme')).toBeNull();
		});
	});

	describe('componentDidmount test', () => {
		test('happy case', () => {
			const spyon = jest.spyOn(S3Image.prototype, 'load');

			const wrapper = mount(<S3Image />);

			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('getImageSource test', () => {
		test('happy case', () => {
			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();

			const spyon = jest.spyOn(Storage, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('url');
				});
			});

			s3Image.getImageSource('key', 'level', false, 'identityId');
			expect(spyon).toBeCalledWith('key', {
				level: 'level',
				track: false,
				identityId: 'identityId',
			});
			spyon.mockClear();
		});

		test('error case', () => {
			const wrapper = shallow(<S3Image />);
			const s3Image = wrapper.instance();

			const spyon = jest.spyOn(Storage, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});

			try {
				s3Image.getImageSource('key', 'level', false);
			} catch (e) {
				expect(e).not.toBeNull();
			}

			spyon.mockClear();
		});
	});
});
