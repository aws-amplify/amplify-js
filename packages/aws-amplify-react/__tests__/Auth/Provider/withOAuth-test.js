import Auth from '@aws-amplify/auth';
import * as React from 'react';
import { Component } from 'react';
import withOAuth, { OAuthButton } from '../../../src/Auth/Provider/withOAuth';
import { SignInButton, Button } from '../../../src/AmplifyUI';

describe('withOAuth test', () => {
    describe('render test', () => {
        test('render correctly', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            };

            const Comp = withOAuth(MockComp);
            const wrapper = shallow(<Comp/>);
            expect(wrapper).toMatchSnapshot();
        });

        test('render correctly with button', () => {
            const wrapper = shallow(<OAuthButton/>);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('signIn test', () => {
        test('happy case with connected response', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            };

            const spyon = jest.spyOn(Auth, 'federatedSignIn');
            const spyon2 = jest.spyOn(Auth, 'handleAuthResponse');
            
            const Comp = withOAuth(MockComp);
            const wrapper = mount(<Comp/>);
            const comp = wrapper.instance();

            comp.signIn();

            expect(spyon).toBeCalledWith(undefined);
            expect(spyon2).toBeCalled();
            spyon.mockClear();
            spyon2.mockClear();
        });

        test('Passing in a social provider', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            };

            const spyon = jest.spyOn(Auth, 'federatedSignIn');
            const spyon2 = jest.spyOn(Auth, 'handleAuthResponse');
            
            const Comp = withOAuth(MockComp);
            const wrapper = mount(<Comp/>);
            const comp = wrapper.instance();

            comp.signIn('Facebook');

            expect(spyon).toBeCalledWith({"provider": "Facebook"});
            expect(spyon2).toBeCalled();
            spyon.mockClear();
            spyon2.mockClear();
        });
    });
});
