import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { SignOut } from '../../src/Auth/SignOut';

const acceptedStates = [
    'signedIn'
];

const deniedStates = [
    'signIn',  
    'signedUp', 
    'signedOut',
    'forgotPassword',
    'signUp',
    'confirmSignIn',
    'confirmSignUp',
    'verifyContact'
];

describe('SignOut', () => {
    describe('normal case', () => {
        test('render correctly with authState signedIn', () => {
            const wrapper = shallow(<SignOut/>);
            for (let i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: 'theme'
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('render correctly with hide', () => {
            const wrapper = shallow(<SignOut/>);
            for (let i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: 'theme',
                    hide: [SignOut]
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('render correctly with empty hide', () => {
            const wrapper = shallow(<SignOut/>);
            for (let i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: 'theme',
                    hide: []
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

    });
   
    test('render correctly with other authStates', () => {
        const wrapper = shallow(<SignOut/>);
        
        for (let i = 0; i < deniedStates.length; i += 1){
            wrapper.setProps({
                authState: deniedStates[i],
                theme: 'theme'
            });

            expect(wrapper).toMatchSnapshot();
        }
    });

    describe('signOut test', () => {
        test('happy case', async () => {
            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'signOut').mockImplementationOnce(() => {
                return Promise.resolve();
            });

            await signOut.signOut();

            expect(spyon).toBeCalled();
            spyon.mockClear();
        });

        test('error case', async () => {
            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'signOut').mockImplementationOnce(() => {
                return Promise.reject('error');
            });

            await signOut.signOut();

            expect(spyon).toBeCalled();
            spyon.mockClear();
        });
    });
});
