import S3Album from '../../src/Storage/S3Album';
import React from 'react';
import { Storage } from 'aws-amplify';

describe('S3Album', () => {
    test('render correctly if has images', () => {
        const wrapper = shallow(<S3Album/>);

        wrapper.setState({images: [{
            path: 'path',
            key: 'imageKey'
        }]});
        expect(wrapper).toMatchSnapshot();
    });

    test('render nothing if no image', () => {
        const wrapper = shallow(<S3Album/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('test componentDidMount with filter', async () => {
        const spyon = jest.spyOn(Storage, 'list')
            .mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('data');
                });
            });

        const wrapper = await mount(<S3Album filter={jest.fn().mockImplementation((data) => {
            return data;
            })}/>);
        expect(spyon).toBeCalled();

        spyon.mockClear();
        wrapper.unmount();
    });
});
