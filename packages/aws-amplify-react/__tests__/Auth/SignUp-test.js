import Auth from '@aws-amplify/auth';
import SignUp from '../../src/Auth/SignUp';
import React from 'react';
import AmplifyTheme from '../../src/AmplifyTheme';
import AuthPiece from '../../src/Auth/AuthPiece';
import { Header, Footer, Input, Button } from '../../src/Amplify-UI/Amplify-UI-Components-React';

const acceptedStates = [
    'signUp'
];

const deniedStates = [
    'signIn',  
    'signedUp', 
    'signedOut',
    'forgotPassword',
    'signedIn',
    'confirmSignIn',
    'confirmSignUp',
    'verifyContact'
];

describe('signUp', () => {
    describe('normal case', () => {
        const wrapper = shallow(<SignUp/>);

        test('render correctly with authState signUp', () => {
            for (var i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: AmplifyTheme
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('render correctly with hide', () => {
            for (var i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: AmplifyTheme,
                    hide: [SignUp]
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('when clicking signUp', async () => {
            const wrapper = shallow(<SignUp/>);
            wrapper.setProps({
                authState: 'signUp',
                theme: AmplifyTheme
            });

            const spyon = jest.spyOn(Auth, 'signUp')
                .mockImplementationOnce((user, password) => {
                    return new Promise((res, rej) => {
                        res();
                    });
                });

            const spyon_changeState = jest.spyOn(wrapper.instance(), 'changeState');

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

            const event_email = {
                target: {
                    name: 'email',
                    value: 'email@amazon.com'
                }
            }
            const event_phone = {
                target: {
                    name: 'phone_line_number',
                    value: '2345678901'
                }
            }

            wrapper.find(Input).at(0).simulate('change', event_username);
            wrapper.find(Input).at(1).simulate('change', event_password);
            wrapper.find(Input).at(2).simulate('change', event_email);
            wrapper.find(Input).at(3).simulate('change', event_phone);
            await wrapper.find(Button).simulate('click');


            expect(spyon).toBeCalledWith({"attributes": {"email": "email@amazon.com", "phone_number": "+12345678901"}, "password": "abc", "username": "user1"});

            expect(spyon_changeState).toBeCalled();
            expect(spyon_changeState.mock.calls[0][0]).toBe('confirmSignUp');

            spyon.mockClear();
            spyon_changeState.mockClear();
        });

    });

    describe('null case with other authState', () => {
        test('render corrently', () => {
            const wrapper = shallow(<SignUp/>);
            
            for (var i = 0; i < deniedStates.length; i += 1){
                wrapper.setProps({
                    authState: deniedStates[i],
                    theme: AmplifyTheme
                });

                expect(wrapper).toMatchSnapshot();
            }
        });
    });
})
