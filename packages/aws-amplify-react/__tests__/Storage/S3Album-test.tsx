import * as React from 'react';
import { Storage } from '@aws-amplify/storage';
import { S3Album } from '../../src/Storage/S3Album';
import { S3Text } from '../../src/Storage/S3Text';
import { S3Image } from '../../src/Storage/S3Image';

// This mock has to be global and before the actual import. We will override and reset in respective tests.
jest.mock('@aws-amplify/core', () => ({
	__esModule: true,
	...jest.requireActual('@aws-amplify/core'),
}));
import * as core from '@aws-amplify/core';

const timespy = jest.spyOn(Date.prototype, 'getTime').mockImplementation(() => {
	return 0;
});

describe('S3Album test', () => {
	describe('render test', () => {
		test('render correctly if has images and texts', () => {
			const wrapper = shallow(<S3Album picker />);

			wrapper.setState({
				items: [
					{
						path: 'path',
						key: 'imageKey',
						contentType: 'application/json',
					},
					{
						path: 'path',
						key: 'textKey',
						contentType: 'image',
					},
				],
			});
			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('interaction test', () => {
		test('S3Text onclick', () => {
			const spyon = jest
				.spyOn(S3Album.prototype, 'handleClick')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<S3Album picker />);

			wrapper.setState({
				items: [
					{
						path: 'path',
						key: 'imageKey',
						contentType: 'application/json',
					},
					{
						path: 'path',
						key: 'textKey',
						contentType: 'image',
					},
				],
			});

			wrapper.find(S3Text).simulate('click');

			expect(spyon).toBeCalledWith({
				path: 'path',
				key: 'imageKey',
				contentType: 'application/json',
			});

			spyon.mockClear();
		});

		test('S3Image onclick', () => {
			const spyon = jest
				.spyOn(S3Album.prototype, 'handleClick')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<S3Album picker />);

			wrapper.setState({
				items: [
					{
						path: 'path',
						key: 'imageKey',
						contentType: 'application/json',
					},
					{
						path: 'path',
						key: 'textKey',
						contentType: 'image',
					},
				],
			});

			wrapper.find(S3Image).simulate('click');

			expect(spyon).toBeCalledWith({
				path: 'path',
				key: 'textKey',
				contentType: 'image',
			});

			spyon.mockClear();
		});
	});

	describe('getKey test', () => {
		test('happy case with string type', () => {
			const props = {
				fileToKey: 'fileToKey',
			};

			const wrapper = shallow(<S3Album />);
			const s3Album = wrapper.instance();
			wrapper.setProps(props);

			const file = {
				name: 'name',
				size: 'size',
				type: 'type',
			};

			expect(s3Album.getKey(file)).toBe('fileToKey');
		});

		test('happy case with function type', () => {
			const mockFn = jest.fn();

			const props = {
				fileToKey: mockFn,
			};

			const wrapper = shallow(<S3Album />);
			const s3Album = wrapper.instance();
			wrapper.setProps(props);

			const file = {
				name: 'name',
				size: 'size',
				type: 'type',
			};

			s3Album.getKey(file);

			expect(mockFn).toBeCalledWith({
				name: 'name',
				size: 'size',
				type: 'type',
			});
		});

		test('happy case with object type', () => {
			const props = {
				fileToKey: {
					attr: 'attr',
				},
			};

			const wrapper = shallow(<S3Album />);
			const s3Album = wrapper.instance();
			wrapper.setProps(props);

			const file = {
				name: 'name',
				size: 'size',
				type: 'type',
			};

			expect(s3Album.getKey(file)).toBe('%7B%22attr%22:%22attr%22%7D');
		});
	});

	describe('handlePick test', () => {
		const onPick = jest.fn();
		const onLoad = jest.fn();
		const onError = jest.fn();

		test('happy case with item updated', async () => {
			const data = {
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			};

			const spyon = jest
				.spyOn(S3Album.prototype, 'getKey')
				.mockImplementationOnce(() => {
					return '';
				});

			const spyon2 = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('data');
				});
			});

			const props = {
				onPick,
				onLoad,
				onError,
				path: 'path',
			};
			const state = {
				items: [{ key: 'path' }],
			};

			const wrapper = shallow(<S3Album />);
			const s3Album = wrapper.instance();
			wrapper.setProps(props);
			wrapper.setState(state);

			await s3Album.handlePick(data);

			expect.assertions(2);
			expect(spyon).toBeCalledWith({
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			});
			expect(spyon2).toBeCalledWith('path', 'file', {
				contentType: 'type',
				level: 'public',
				track: undefined,
			});

			spyon.mockClear();
			spyon2.mockClear();
			onPick.mockClear();
			onLoad.mockClear();
			onError.mockClear();
		});

		test('happy case with no item updated', async () => {
			const data = {
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			};

			const spyon = jest
				.spyOn(S3Album.prototype, 'getKey')
				.mockImplementationOnce(() => {
					return '';
				});

			const spyon2 = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('data');
				});
			});

			const spyon3 = jest
				.spyOn(S3Album.prototype, 'marshal')
				.mockImplementationOnce(() => {
					return;
				});

			const props = {
				onPick,
				onLoad,
				onError,
				path: 'path',
			};

			const state = {
				items: [{ key: 'path2' }],
			};

			const wrapper = shallow(<S3Album />);
			const s3Album = wrapper.instance();
			wrapper.setProps(props);
			wrapper.setState(state);

			await s3Album.handlePick(data);

			expect(spyon).toBeCalledWith({
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			});
			expect(spyon2).toBeCalledWith('path', 'file', {
				contentType: 'type',
				level: 'public',
				track: undefined,
			});

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
			onPick.mockClear();
			onLoad.mockClear();
			onError.mockClear();
		});

		test('Storage put error', async () => {
			const data = {
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			};

			const spyon = jest
				.spyOn(S3Album.prototype, 'getKey')
				.mockImplementationOnce(() => {
					return '';
				});

			const spyon2 = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});

			const props = {
				onPick,
				onLoad,
				onError,
				path: 'path',
			};
			const state = {
				items: [{ key: 'path' }],
			};

			const wrapper = shallow(<S3Album />);
			const s3Album = wrapper.instance();
			wrapper.setProps(props);
			wrapper.setState(state);

			await s3Album.handlePick(data);

			expect.assertions(2);
			expect(spyon).toBeCalledWith({
				file: 'file',
				name: 'name',
				size: 'size',
				type: 'type',
			});
			expect(spyon2).toBeCalledWith('path', 'file', {
				contentType: 'type',
				level: 'public',
				track: undefined,
			});

			spyon.mockClear();
			spyon2.mockClear();
			onPick.mockClear();
			onLoad.mockClear();
			onError.mockClear();
		});
	});

	describe('handleClick test', () => {
		const onClickItem = jest.fn();
		const onSelect = jest.fn();

		test('happy case', () => {
			const wrapper = shallow(
				<S3Album picker onClickItem={onClickItem} onSelect={onSelect} select />
			);

			wrapper.setState({
				items: [
					{
						path: 'path',
						key: 'imageKey',
						contentType: 'application/json',
					},
					{
						path: 'path',
						key: 'textKey',
						contentType: 'image',
					},
				],
			});

			wrapper.find(S3Text).simulate('click');

			expect(onSelect).toBeCalledWith(
				{
					contentType: 'application/json',
					key: 'imageKey',
					path: 'path',
					selected: true,
				},
				[
					{
						contentType: 'application/json',
						key: 'imageKey',
						path: 'path',
						selected: true,
					},
				]
			);

			onSelect.mockClear();
		});

		test('no select props', () => {
			const wrapper = shallow(
				<S3Album picker onClickItem={onClickItem} onSelect={onSelect} />
			);

			wrapper.setState({
				items: [
					{
						path: 'path',
						key: 'imageKey',
						contentType: 'application/json',
					},
					{
						path: 'path',
						key: 'textKey',
						contentType: 'image',
					},
				],
			});

			wrapper.find(S3Text).simulate('click');

			expect(onSelect).not.toBeCalled();

			onSelect.mockClear();
		});

		test('no onselect func', () => {
			const wrapper = shallow(
				<S3Album picker onClickItem={onClickItem} select />
			);

			wrapper.setState({
				items: [
					{
						path: 'path',
						key: 'imageKey',
						contentType: 'application/json',
					},
					{
						path: 'path',
						key: 'textKey',
						contentType: 'image',
					},
				],
			});

			wrapper.find(S3Text).simulate('click');

			expect(onSelect).not.toBeCalled();

			onSelect.mockClear();
		});

		onClickItem.mockClear();
		onSelect.mockClear();
	});

	describe('list test', () => {
		test('happy case', async () => {
			// this is for component did mount
			const spyon = jest.spyOn(Storage, 'list').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('data');
				});
			});

			const spyon2 = jest
				.spyOn(S3Album.prototype, 'marshal')
				.mockImplementationOnce(() => {
					return;
				});

			const props = {
				path: 'path',
				level: 'public',
				identityId: 'identityId',
			};

			const wrapper = shallow(<S3Album />);
			const s3Album = wrapper.instance();
			wrapper.setProps(props);

			const spyon3 = jest.spyOn(Storage, 'list').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('data');
				});
			});

			await s3Album.list();

			expect(spyon3).toBeCalledWith('path', {
				level: 'public',
				identityId: 'identityId',
			});

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
		});

		test('storage list error', async () => {
			const spyon = jest.spyOn(Storage, 'list').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res('data');
				});
			});

			const props = {
				path: 'path',
				level: 'public',
			};

			const wrapper = shallow(<S3Album />);
			const s3Album = wrapper.instance();
			wrapper.setProps(props);

			const spyon2 = jest.spyOn(Storage, 'list').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});

			expect(await s3Album.list()).toEqual([]);

			spyon.mockClear();
			spyon2.mockClear();
		});
	});

	describe('contentType test', () => {
		test('happy case', () => {
			const originalFunc = core.filenameToContentType;
			core.filenameToContentType = jest.fn();

			const wrapper = shallow(<S3Album />);
			const s3Album = wrapper.instance();

			s3Album.contentType({
				key: 'key',
			});

			expect(core.filenameToContentType).toBeCalledWith('key', 'image/*');
			core.filenameToContentType = originalFunc;
		});
	});

	describe('marshal test', () => {
		test('happy case with contentType string', async () => {
			const spyon = jest.spyOn(Storage, 'list').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res([{ data: 'data', key: 'data-1' }]);
				});
			});
			const wrapper = await mount(<S3Album contentType="string" />);

			expect(wrapper.state('items')).toEqual([
				{ contentType: 'string', data: 'data', key: 'data-1' },
			]);

			spyon.mockClear();
			await wrapper.unmount();
		});
	});
});
