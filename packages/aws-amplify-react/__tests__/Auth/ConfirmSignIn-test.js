import ConfirmSignIn from '../../src/Auth/ConfirmSignIn';
import React from 'react';
import AmplifyTheme from '../../src/AmplifyTheme';
import AuthPiece from '../../src/Auth/AuthPiece';
import { Header, Footer, InputRow, ButtonRow, Link } from '../../src/AmplifyUI';
import { Auth } from 'aws-amplify';

const acceptedStates = [
    'confirmSignIn'
];

const deniedStates = [
    'signIn',  
    'signedUp', 
    'signedOut',
    'signUp',
    'signedIn',
    'confirmSignUp',
    'forgotPassword',
    'verifyContact'
];

describe('ConfirmSignIn', () => {
    describe('normal case', () => {
        test('render correctly with Props confirmSignIn', () => {
            const wrapper = shallow(<ConfirmSignIn/>);
            for (var i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: AmplifyTheme
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('simulate clicking confirm button', async () => {
            const spyon = jest.spyOn(Auth, 'confirmSignIn')
                .mockImplementation((user, code) => {
                    return new Promise((res, rej) => {
                        res();
                    })
                });

            const wrapper = shallow(<ConfirmSignIn/>);
            const spyon2 = jest.spyOn(wrapper.instance(), 'changeState');
            wrapper.setProps({
                authState: acceptedStates[0],
                theme: AmplifyTheme,
                authData: 'user'
            });

            const event_code = {
                target: {
                    name: 'code',
                    value: '123456'
                }
            }

            wrapper.find(InputRow).at(0).simulate('change', event_code);
            await wrapper.find(ButtonRow).at(0).simulate('click');

            expect.assertions(3);
            expect(spyon.mock.calls[0][0]).toBe('user');
            expect(spyon.mock.calls[0][1]).toBe('123456');
            expect(spyon2).toBeCalledWith('signedIn', 'user');

            spyon.mockClear();
            spyon2.mockClear();
        });

        test('back to sign in', () => {
            const wrapper = shallow(<ConfirmSignIn/>);
            const spyon2 = jest.spyOn(wrapper.instance(), 'changeState');
            wrapper.setProps({
                authState: acceptedStates[0],
                theme: AmplifyTheme,
                authData: 'user'
            });

            wrapper.find(Link).at(0).simulate('click');
            expect(spyon2).toBeCalledWith('signIn');

            spyon2.mockClear();
        });
    });

    describe('null case with other authState', () => {
        test('render corrently', () => {
            const wrapper = shallow(<ConfirmSignIn/>);
            
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
