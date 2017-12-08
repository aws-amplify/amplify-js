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