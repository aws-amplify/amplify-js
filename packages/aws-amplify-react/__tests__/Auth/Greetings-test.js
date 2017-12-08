/*
jest.mock('aws-sdk-mobile-analytics', () => {
    const Manager = () => {}

    Manager.prototype.recordEvent = () => {

    }

    Manager.prototype.recordMonetizationEvent = () => {

    }

    var ret =  {
        Manager: Manager
    }
    return ret;
});
*/

jest.mock('aws-sdk/clients/pinpoint', () => {
    const Pinpoint = () => {
        var pinpoint = null;
        return pinpoint;
    }

    Pinpoint.prototype.updateEndpoint = (params, callback) => {
        callback(null, 'data');
    }

    return Pinpoint;
});

import Greetings from '../../src/Auth/Greetings';
import React from 'react';
import AmplifyTheme from '../../src/AmplifyTheme';
import AuthPiece from '../../src/Auth/AuthPiece';
import { Header, Footer, InputRow, ButtonRow } from '../../src/AmplifyUI';
import { Auth } from 'aws-amplify';

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

describe('signUp', () => {
    describe('normal case', () => {
        test('render correctly with authState signedIn', () => {
            const wrapper = shallow(<Greetings/>);
            for (var i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: AmplifyTheme
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('checkUser when component mount', async () => {
            const spyon = jest.spyOn(Auth, 'currentAuthenticatedUser')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res('user');
                    });
                });
            const wrapper = mount(<Greetings />);
            //wrapper.setState({authState: 'signedIn'});

            
        })
    });

   
    test('render corrently with other authStates', () => {
        const wrapper = shallow(<Greetings/>);
        
        for (var i = 0; i < deniedStates.length; i += 1){
            wrapper.setProps({
                authState: deniedStates[i],
                theme: AmplifyTheme
            });

            expect(wrapper).toMatchSnapshot();
        }
    });
});