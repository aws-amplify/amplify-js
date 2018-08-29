import Auth from '@aws-amplify/auth';
import Greetings from '../../src/Auth/Greetings';
import React from 'react';
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
            for (var i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: 'theme'
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('render correctly with hide', () => {
            const wrapper = shallow(<Greetings/>);
            for (var i = 0; i < acceptedStates.length; i += 1){
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
            })  

            expect(wrapper).toMatchSnapshot();
        })
    });

   
    test('render corrently with other authStates', () => {
        const wrapper = shallow(<Greetings/>);
        
        for (var i = 0; i < deniedStates.length; i += 1){
            wrapper.setProps({
                authState: deniedStates[i],
                theme: 'theme'
            });

            expect(wrapper).toMatchSnapshot();
        }
    });

    describe('signOut test', () => {
        test('happy case', async () => {
            const wrapper = shallow(<Greetings/>);
            const greetings = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'signOut').mockImplementationOnce(() => {
                return Promise.resolve();
            });

            await greetings.signOut();

            expect(spyon).toBeCalled();
            spyon.mockClear();
        });

        test('error case', async () => {
            const wrapper = shallow(<Greetings/>);
            const greetings = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'signOut').mockImplementationOnce(() => {
                return Promise.reject('error');
            });

            await greetings.signOut();

            expect(spyon).toBeCalled();
            spyon.mockClear();
        });
    });

    describe('google signOut test', () => {
        test('happy case', async () => {
            const mockFn = jest.fn();

            window.gapi = {
                auth2: {
                    getAuthInstance() {
                        return Promise.resolve({
                            signOut: mockFn
                        })
                    }
                }
            };

            const wrapper = shallow(<Greetings/>);
            const greetings = wrapper.instance();

            await greetings.googleSignOut();

            expect(mockFn).toBeCalled();
        });

        test('no auth2', async () => {
            window.gapi = null;
            const wrapper = shallow(<Greetings/>);
            const greetings = wrapper.instance();

            expect(await greetings.googleSignOut()).toBeNull();
        });

        test('no googleAuth', async () => {
            window.gapi = {
                auth2: {
                    getAuthInstance() {
                        return Promise.resolve(null);
                    }
                }
            };

            const wrapper = shallow(<Greetings/>);
            const greetings = wrapper.instance();

            await greetings.googleSignOut();
        });
    });

    describe('facebook signout test', () => {
        test('happy case', async () => {
            window.FB = {
                getLoginStatus(callback) {
                    callback({
                        status: 'connected'
                    })
                },
                logout(callback) {
                    callback('response');
                }
            }

            const wrapper = shallow(<Greetings/>);
            const greetings = wrapper.instance();
            
            await greetings.facebookSignOut()
        });

        test('not connected', async () => {
            window.FB = {
                getLoginStatus(callback) {
                    callback({
                        status: 'not connected'
                    })
                },
                logout(callback) {
                    callback('response');
                }
            }
            const wrapper = shallow(<Greetings/>);
            const greetings = wrapper.instance();
            
            await greetings.facebookSignOut()
        });
    });

    describe('checkUser test', () => {
        test('happy case', async () => {
            const wrapper = shallow(<Greetings/>);
            const greetings = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'currentAuthenticatedUser').mockImplementationOnce(() => {
                return Promise.resolve('user');
            })

            await greetings.checkUser();

            expect(spyon).toBeCalled();
        });
        
    });
});
