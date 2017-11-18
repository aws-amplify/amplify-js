import VerifyContact from '../../src/Auth/VerifyContact';
import React from 'react';
import AmplifyTheme from '../../src/AmplifyTheme';
import AuthPiece from '../../src/Auth/AuthPiece';
import { Header, Footer, InputRow, RadioRow, MessageRow, ButtonRow } from '../../src/AmplifyUI';
import { Auth } from 'aws-amplify';

const acceptedStates = [
    'verifyContact'
];

const deniedStates = [
    'signIn',  
    'signedUp', 
    'signedOut',
    'forgotPassword',
    'signedIn',
    'confirmSignIn',
    'confirmSignUp',
    'signUp'
];

describe('signUp', () => {
    describe('normal case', () => {
        test('render correctly with authState verifyContact', () => {
            const wrapper = shallow(<VerifyContact/>);
            for (var i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: AmplifyTheme,
                    authData: {
                    unverified: {
                        email: 'email@amazon.com',
                        phone_number: '+12345678901'
                        }
                    }   
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('simulate clicking verify button with both email and phone', async () => {
            const spyon = jest.spyOn(Auth, 'verifyCurrentUserAttribute')
                .mockImplementation((attr) => {
                    return new Promise((res, rej) => {
                        res('data');
                    })
                });

            const wrapper = shallow(<VerifyContact/>);
            const spyon2 = jest.spyOn(wrapper.instance(), 'setState');
            wrapper.setProps({
                authState: acceptedStates[0],
                theme: AmplifyTheme,
                authData: {
                    unverified: {
                        email: 'email@amazon.com',
                        phone_number: '+12345678901'
                    }
                }
            });

            const event_email = {
                target: {
                    name: 'email',
                    value: 'email@amazon.com'
                }
            }
            const event_phoneNumber = {
                target: {
                    name: 'phone_number',
                    value: '+12345678901'
                }
            }

            wrapper.find(RadioRow).at(0).simulate('change', event_email);
            wrapper.find(RadioRow).at(1).simulate('change', event_phoneNumber);

            await wrapper.find(ButtonRow).at(0).simulate('click');
            
            expect.assertions(2);
            expect(spyon.mock.calls[0][0]).toBe('email');
            expect(spyon2.mock.calls[0][0]).toEqual({verifyAttr: 'email'});

            spyon.mockClear();
            spyon2.mockClear();
        }); 

        test('simulate clicking verify button without neither email or phone', async () => {
            const spyon = jest.spyOn(Auth, 'verifyCurrentUserAttribute')
                .mockImplementation((attr) => {
                    return new Promise((res, rej) => {
                        res('data');
                    })
                });

            const wrapper = shallow(<VerifyContact/>);

            const spyon2 = jest.spyOn(wrapper.instance(), 'error');

            wrapper.setProps({
                authState: acceptedStates[0],
                theme: AmplifyTheme,
                authData: {
                    unverified: {
                        email: null,
                        phone_number: null
                    }
                }
            });

            await wrapper.find(ButtonRow).at(0).simulate('click');

            expect.assertions(1);
            expect(spyon2).toBeCalled();

            spyon.mockClear();
            spyon2.mockClear();
        }); 

        test('simulating clicking submit button', async () => {
            const spyon = jest.spyOn(Auth, 'verifyCurrentUserAttributeSubmit')
                .mockImplementation((attr, code) => {
                    return new Promise((res, rej) => {
                        res('data');
                    })
                });

            const wrapper = shallow(<VerifyContact/>);
            const spyon2 = jest.spyOn(wrapper.instance(), 'changeState');

            wrapper.setProps({
                authState: acceptedStates[0],
                theme: AmplifyTheme,
                authData: {
                    unverified: {
                        email: 'email@amazon.com',
                        phone_number: '+12345678901'
                    }
                }
            });

           const event_code = {
                target: {
                    name: 'code',
                    value: '123456'
                }
            }

            wrapper.setState({verifyAttr: true});

            wrapper.find(InputRow).at(0).simulate('change', event_code);

            await wrapper.find(ButtonRow).at(0).simulate('click');


            expect.assertions(3);
            expect(spyon.mock.calls[0][0]).toBe(true);
            expect(spyon.mock.calls[0][1]).toBe('123456')
            expect(spyon2).toBeCalled();

            spyon.mockClear();
        });
    });

    describe('null case with other authState', () => {
        test('render corrently', () => {
            const wrapper = shallow(<VerifyContact/>);
            
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