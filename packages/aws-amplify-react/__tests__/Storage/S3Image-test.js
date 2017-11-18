import S3Image from '../../src/Storage/S3Image';
import React from 'react';
import { Logger, Storage } from 'aws-amplify';

describe('S3Image', () => {
    test('render correctly if has srcs', () => {
        const wrapper = shallow(<S3Image/>);

        wrapper.setState({src: 'src'});
        expect(wrapper).toMatchSnapshot();
    });

    test('render nothing if no src', () => {
        const wrapper = shallow(<S3Image/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('mount S3 image with no path', () => {
        const spyon = jest.spyOn(Logger.prototype, 'debug');
        const wrapper = mount(<S3Image/>);

        expect(spyon).toBeCalled();
    });

    test('mount S3 image with path', async () => {
        const spyon = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
            return new Promise((res, rej) => {
                res('data');
            });
        });
        const wrapper = await mount(<S3Image path={'path'} body={'something'} />);

        expect(spyon).toBeCalled();

        spyon.mockClear();
    });

    test('mount S3 image with path and error when putting', async () => {
        const spyon = jest.spyOn(Storage, 'put').mockImplementationOnce(() => {
            return new Promise((res, rej) => {
                rej('err');
            });
        });
        const wrapper = await mount(<S3Image path={'path'} body={'something'} />);

        expect(spyon).toBeCalled();

        spyon.mockClear();
    });

    test('mount S3 image with path and error when putting', async () => {
        const spyon = jest.spyOn(Storage, 'get').mockImplementationOnce(() => {
            return new Promise((res, rej) => {
                res('data');
            });
        });
        const wrapper = await mount(<S3Image path={'path'} body={null} />);

        expect(spyon).toBeCalled();

        spyon.mockClear();
    });

});
