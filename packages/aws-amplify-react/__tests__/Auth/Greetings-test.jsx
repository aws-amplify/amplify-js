import * as React from 'react';
import { Greetings } from '../../src/Auth/Greetings';

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

describe('Greetings', () => {
    describe('normal case', () => {
        test('render correctly with authState signedIn', () => {
            const wrapper = shallow(<Greetings/>);
            for (let i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    authData: {
                        attributes: {
                            name: 'username'
                        }
                    },
                    theme: 'theme'
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('render correctly with hide', () => {
            const wrapper = shallow(<Greetings/>);
            for (let i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: 'theme',
                    hide: [Greetings]
                });
                expect(wrapper).toMatchSnapshot();
            }
        });
    });

   
    test('render corrently with other authStates', () => {
        const wrapper = shallow(<Greetings/>);
        
        for (let i = 0; i < deniedStates.length; i += 1){
            wrapper.setProps({
                authState: deniedStates[i],
                theme: 'theme'
            });

            expect(wrapper).toMatchSnapshot();
        }
    });   
});
