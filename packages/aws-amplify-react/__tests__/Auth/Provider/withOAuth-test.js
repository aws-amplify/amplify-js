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
            const mockFn = jest.fn();
            window.location.assign = mockFn;
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            };

            const spyon = jest.spyOn(Auth, 'configure').mockImplementation(() => {
                return {
                    oauth: {
                        awsCognito: {
                            domain: 'domain',
                            redirectSignIn: 'redirectUriSignIn',
                            redirectSignOut: 'redirectUriSignOut',
                            responseType: 'responseType'
                        }
                    },
                    userPoolWebClientId: 'userPoolWebClientId'
                };
            });
            const Comp = withOAuth(MockComp);
            const wrapper = shallow(<Comp/>);
            const comp = wrapper.instance();

            comp.signIn();
            expect(mockFn).toBeCalledWith(
                "https://domain/login?redirect_uri=redirectUriSignIn&response_type=responseType&client_id=userPoolWebClientId"
            );
            spyon.mockClear();
        });

        test('correctly constructs url with client state from props', () => {
            const mockFn = jest.fn();
            window.location.assign = mockFn;
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            };

            const spyon = jest.spyOn(Auth, 'configure').mockImplementation(() => {
                return {
                    oauth: {
                        awsCognito: {
                            domain: 'domain',
                            redirectSignIn: 'redirectUriSignIn',
                            redirectSignOut: 'redirectUriSignOut',
                            responseType: 'responseType'
                        }
                    },
                    userPoolWebClientId: 'userPoolWebClientId'
                };
            });
            const Comp = withOAuth(MockComp);
            const wrapper = shallow(<Comp OAuthClientState="oAuthClientState" />);
            const comp = wrapper.instance();

            comp.signIn();
            expect(mockFn).toBeCalledWith(
              "https://domain/login?redirect_uri=redirectUriSignIn&response_type=responseType&client_id=userPoolWebClientId&state=oAuthClientState"
            );
            spyon.mockClear();
        });

        test('correctly constructs url with client state from props when prop has value of false', () => {
            const mockFn = jest.fn();
            window.location.assign = mockFn;
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            };

            const spyon = jest.spyOn(Auth, 'configure').mockImplementation(() => {
                return {
                    oauth: {
                        awsCognito: {
                            domain: 'domain',
                            redirectSignIn: 'redirectUriSignIn',
                            redirectSignOut: 'redirectUriSignOut',
                            responseType: 'responseType'
                        }
                    },
                    userPoolWebClientId: 'userPoolWebClientId'
                };
            });
            const Comp = withOAuth(MockComp);
            const wrapper = shallow(<Comp OAuthClientState={false} />);
            const comp = wrapper.instance();

            comp.signIn();
            expect(mockFn).toBeCalledWith(
              "https://domain/login?redirect_uri=redirectUriSignIn&response_type=responseType&client_id=userPoolWebClientId&state=false"
            );
            spyon.mockClear();
        });
    });
});
