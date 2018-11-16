import Auth from '@aws-amplify/auth';
import Greetings from '../../src/Auth/Greetings';
import * as React from 'react';
import AmplifyTheme from '../../src/AmplifyTheme';
import AuthPiece from '../../src/Auth/AuthPiece';
import { Header, Footer, Input, Button } from '../../src/Amplify-UI/Amplify-UI-Components-React';

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

        test('render name from attributes', () => {
            const wrapper = shallow(<Greetings/>);
            wrapper.setProps({
                authState: 'signedIn',
                theme: 'theme'
            });

            wrapper.setState({
                authData: {
                    attributes: {
                        name: 'name'
                    }
                },
                authState: 'signedIn'
            });

            expect(wrapper).toMatchSnapshot();
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
