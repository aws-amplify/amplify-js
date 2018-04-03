import React, { Component } from 'react';
import withHostedCognito, { HostedCognitoButton } from '../../../src/Auth/Provider/withHostedCognito';
import { SignInButton, Button } from '../../../src/AmplifyUI';
import { Auth } from 'aws-amplify';

describe('withHostedCognito test', () => {
    describe('render test', () => {
        test('render correctly', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }

            const Comp = withHostedCognito(MockComp);
            const wrapper = shallow(<Comp/>);
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
            const Comp = withHostedCognito(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            comp.signIn();

            spyon.mockClear();
        });
    });
});