import Auth from '@aws-amplify/auth';
import React from 'react';
import Authenticator from '../../src/Auth/Authenticator';
import SignIn from '../../src/Auth/SignIn';
import AmplifyTheme  from '../../src/AmplifyTheme';
import { Button, InputRow } from '../../src/Amplify-UI/Amplify-UI-Components-React';

const waitForResolve = Promise.resolve();

describe('Authenticator', () => {
    describe('normal case', () => {
        test('render if no error', () => {
            const wrapper = shallow(<Authenticator/>);
            wrapper.setProps({
                authState: 'signIn',
                theme: AmplifyTheme
            });
            expect(wrapper).toMatchSnapshot();
        });

        test('render with hidedefault', () => {
            const wrapper = shallow(<Authenticator hidedefault/>);
            wrapper.setProps({
                authState: 'signIn',
                theme: AmplifyTheme
            });
            expect(wrapper).toMatchSnapshot();
        });

        test('render if no error with children', () => {
            const wrapper = shallow(<Authenticator><div></div></Authenticator>);
            wrapper.setProps({
                authState: 'signIn',
                theme: AmplifyTheme
            });
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe.skip('handleStateChange test', () => {
        test('when user sign in and need confirmation', async () => {
            const wrapper = shallow(<Authenticator/>);

            const spyon = jest.spyOn(Auth, 'signIn')
                    .mockImplementationOnce((user, password) => {
                        return new Promise((res, rej) => {
                            res({
                                challengeName: 'SMS_MFA'
                            });
                        });
                    });

            const event_username = {
                target: {
                    name: 'username',
                    value: 'user1'
                }
            }
            const event_password = {
                target: {
                    name: 'password',
                    value: 'abc'
                }
            }

            const signInWrapper = wrapper.find(SignIn).dive();
            signInWrapper.find(InputRow).at(0).simulate('change', event_username);
            signInWrapper.find(InputRow).at(1).simulate('change', event_password);
            await signInWrapper.find(Button).simulate('click');

            expect(wrapper.state()).toEqual({
                "auth": "confirmSignIn", 
                "authData": {"challengeName": "SMS_MFA"}, 
                "error": null
            });

            spyon.mockClear();
        });
    });

    describe.skip('handleAuthEvent test', () => {
        test('when user sign in failed', async () => {
            const wrapper = shallow(<Authenticator/>);

            const spyon = jest.spyOn(Auth, 'signIn')
                    .mockImplementationOnce((user, password) => {
                        return new Promise((res, rej) => {
                            rej('err');
                        });
                    });

            const event_username = {
                target: {
                    name: 'username',
                    value: 'user1'
                }
            }
            const event_password = {
                target: {
                    name: 'password',
                    value: 'abc'
                }
            }

            const signInWrapper = wrapper.find(SignIn).dive();
            signInWrapper.find(Input).at(0).simulate('change', event_username);
            signInWrapper.find(Input).at(1).simulate('change', event_password);
            await signInWrapper.find(Button).simulate('click');

            expect(wrapper.state()).toEqual({
                "auth": "signIn"
            });

            spyon.mockClear();
        });
    });

    
});

