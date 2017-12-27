import React, { Component } from 'react';
import withFacebook from '../../../src/Auth/Provider/withFacebook';
import withGoogle from '../../../src/Auth/Provider/withGoogle';
import { withFederated } from '../../../src/Auth/Provider/index';

describe('withFederated test', () => {
    describe('render test', () => {
        test('render correctly', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            const Comp = withFederated(MockComp);
            const wrapper = shallow(<Comp/>);
            expect(wrapper).toMatchSnapshot();
        });
    });
});