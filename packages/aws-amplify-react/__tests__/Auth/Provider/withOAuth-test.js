import React, { Component } from 'react';
import withOAuth, { OAuthButton } from '../../../src/Auth/Provider/withOAuth';
import { SignInButton, Button } from '../../../src/AmplifyUI';
import { Auth } from 'aws-amplify';

describe('withOAuth test', () => {
    describe('render test', () => {
        test('render correctly', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }

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
            }

            const spyon = jest.spyOn(Auth, 'configure').mockImplementationOnce(() => {
                return {
                    hostedUIOptions: {
                        AppWebDomain: 'domain',
                        RedirectUriSignIn: 'redirectUriSignIn',
                        RedirectUriSignOut: 'redirectUriSignOut',
                        ResponseType: 'responseType'
                    },
                    userPoolWebClientId: 'userPoolWebClientId'
                }
            })
            const Comp = withOAuth(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            comp.signIn();

            spyon.mockClear();
        });
    });
});