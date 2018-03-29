import React, { Component } from 'react';
import withFacebook from '../../../src/Auth/Provider/withFacebook';
import withGoogle from '../../../src/Auth/Provider/withGoogle';
import { withFederated } from '../../../src/Auth/Provider/index';

describe('withFederated test', () => {
    const MockComp = class extends Component {
        render() {
            return <div />;
        }
    };

    describe('render test', () => {
        test('render correctly', () => {
            const Comp = withFederated(MockComp);
            const wrapper = shallow(<Comp />);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('HoC options', () => {
        it('should default with Amazon, Google and Facebook', () => {
            const Comp = withFederated(MockComp);
            const amzWrapper = shallow(<Comp />).dive();
            expect(amzWrapper).toHaveProp('amz');
            expect(amzWrapper).toHaveProp('amazonSignIn');
            const gaWrapper = amzWrapper.dive();
            expect(gaWrapper).toHaveProp('ga');
            expect(gaWrapper).toHaveProp('googleSignIn');
            const fbWrapper = gaWrapper.dive();
            expect(fbWrapper).toHaveProp('fb');
            expect(fbWrapper).toHaveProp('facebookSignIn');
        });

        it('should allow to only specify amazon', () => {
            const Comp = withFederated(MockComp, { amazon: true });
            const amzWrapper = shallow(<Comp />).dive();
            expect(amzWrapper).toHaveProp('amz');
            expect(amzWrapper).toHaveProp('amazonSignIn');
            const baseComp = amzWrapper.dive();
            expect(baseComp.props()).toEqual({});
        });

        it('should allow to only specify facebook', () => {
            const Comp = withFederated(MockComp, { facebook: true });
            const fbWrapper = shallow(<Comp />).dive();
            expect(fbWrapper).toHaveProp('fb');
            expect(fbWrapper).toHaveProp('facebookSignIn');
            const baseComp = fbWrapper.dive();
            expect(baseComp.props()).toEqual({});
        });

        it('should allow to only specify google', () => {
            const Comp = withFederated(MockComp, { google: true });
            const gaWrapper = shallow(<Comp />).dive();
            expect(gaWrapper).toHaveProp('ga');
            expect(gaWrapper).toHaveProp('googleSignIn');
            const baseComp = gaWrapper.dive();
            expect(baseComp.props()).toEqual({});
        });

        it('should allow 2 of 3 providers', () => {
            const Comp = withFederated(MockComp, {
                amazon: true,
                facebook: true
            });
            const amzWrapper = shallow(<Comp />).dive();
            expect(amzWrapper).toHaveProp('amz');
            expect(amzWrapper).toHaveProp('amazonSignIn');
            const fbWrapper = amzWrapper.dive();
            expect(fbWrapper).toHaveProp('fb');
            expect(fbWrapper).toHaveProp('facebookSignIn');
            const baseComp = fbWrapper.dive();
            expect(baseComp.props()).toEqual({});
        });
    });
});
