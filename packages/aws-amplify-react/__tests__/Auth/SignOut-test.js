import Auth from '@aws-amplify/auth';
import SignOut from '../../src/Auth/SignOut';
import React from 'react';
import AmplifyTheme from '../../src/AmplifyTheme';
import AuthPiece from '../../src/Auth/AuthPiece';
import { Header, Footer, InputRow, ButtonRow } from '../../src/AmplifyUI';

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
            for (var i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: 'theme'
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('render correctly with hide', () => {
            const wrapper = shallow(<SignOut/>);
            for (var i = 0; i < acceptedStates.length; i += 1){
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
            for (var i = 0; i < acceptedStates.length; i += 1){
                wrapper.setProps({
                    authState: acceptedStates[i],
                    theme: 'theme',
                    hide: []
                });
                expect(wrapper).toMatchSnapshot();
            }
        });

        test('render name from attributes', () => {
            const wrapper = shallow(<SignOut/>);
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

   
    test('render correctly with other authStates', () => {
        const wrapper = shallow(<SignOut/>);
        
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

            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();

            await signOut.googleSignOut();

            expect(mockFn).toBeCalled();
        });

        test('no auth2', async () => {
            window.gapi = null;
            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();

            expect(await signOut.googleSignOut()).toBeNull();
        });

        test('no googleAuth', async () => {
            window.gapi = {
                auth2: {
                    getAuthInstance() {
                        return Promise.resolve(null);
                    }
                }
            };

            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();

            await signOut.googleSignOut();
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

            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();
            
            await signOut.facebookSignOut()
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
            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();
            
            await signOut.facebookSignOut()
        });
    });

    describe('checkUser test', () => {
        test('happy case', async () => {
            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'currentAuthenticatedUser').mockImplementationOnce(() => {
                return Promise.resolve('user');
            })

            await signOut.checkUser();

            expect(spyon).toBeCalled();
        });
        
        test('no user case', async () => {
            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'currentAuthenticatedUser').mockImplementationOnce(() => {
                return Promise.reject('no user');
            })

            await signOut.checkUser();

            expect(spyon).toBeCalled();
        });
        
        test('check user on mount', async () => {
            const wrapper = shallow(<SignOut/>);
            const signOut = wrapper.instance();

            const spyon = jest.spyOn(Auth, 'currentAuthenticatedUser').mockImplementationOnce(() => {
                return Promise.resolve('user');
            })

            await signOut.componentDidMount();

            expect(spyon).toBeCalled();
        });
    });
});
