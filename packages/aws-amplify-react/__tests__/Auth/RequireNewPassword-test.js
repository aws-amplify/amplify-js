import React, { Component } from 'react';
import { ButtonRow, Link } from '../../src/AmplifyUI';
import RequireNewPassword from '../../src/Auth/RequireNewPassword';
import { Auth } from 'aws-amplify';

describe('RequireNewPassword test', () => {
    describe('render test', () => {
        test('render correctly', () => {
            const wrapper = shallow(<RequireNewPassword/>);

            wrapper.setProps({
                authState: 'requireNewPassword',
                hide: false
            });

            expect(wrapper).toMatchSnapshot();
        });

        test('render nothing with incorrect authState', () => {
            const wrapper = shallow(<RequireNewPassword/>);

            wrapper.setProps({
                authState: 'signIn',
                hide: false
            });

            expect(wrapper).toMatchSnapshot();
        });

        test('render nothing with hide', () => {
            const wrapper = shallow(<RequireNewPassword/>);

            wrapper.setProps({
                authState: 'requireNewPassword',
                hide: [RequireNewPassword]
            });

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('interaction test', () => {
        test('ButtonRow clicked', () => {
            const spyon = jest.spyOn(RequireNewPassword.prototype, 'change').mockImplementationOnce(() => {return;});

            const wrapper = shallow(<RequireNewPassword/>);

            wrapper.setProps({
                authState: 'requireNewPassword',
                hide: false
            });

            wrapper.find(ButtonRow).simulate('click');

            expect(spyon).toBeCalled();
            
            spyon.mockClear();
        });

        test('Link clicked', () => {
            const spyon = jest.spyOn(RequireNewPassword.prototype, 'changeState').mockImplementationOnce(() => {return;});

            const wrapper = shallow(<RequireNewPassword/>);

            wrapper.setProps({
                authState: 'requireNewPassword',
                hide: false
            });

            wrapper.find(Link).simulate('click');

            expect(spyon).toBeCalled();

            spyon.mockClear();
        });
    });

    describe('change test', () => {
        test('happy case', async () => {
            const props = {
                authData: {
                    challengeParam: {
                        requiredAttributes: 'requiredAttributes'
                    } 
                }
            }

            const spyon = jest.spyOn(Auth, 'completeNewPassword').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    res('user');
                });
            });
            const spyon2 = jest.spyOn(RequireNewPassword.prototype, 'changeState').mockImplementationOnce(() => { return; });

            const wrapper = shallow(<RequireNewPassword/>);
            const requireNewPassword = wrapper.instance();

            wrapper.setProps(props);
            requireNewPassword.inputs = {
                password: 'password'
            }

            await requireNewPassword.change();

            expect(spyon).toBeCalledWith({"challengeParam": {"requiredAttributes": "requiredAttributes"}}, 
                                        'password', 
                                        'requiredAttributes');

            expect(spyon2).toBeCalledWith('signedIn', 'user');
            spyon.mockClear();
        });

        test('error happened with Auth completeNewPasword', async () => {
            const props = {
                authData: {
                    challengeParam: {
                        requiredAttributes: 'requiredAttributes'
                    } 
                }
            }

            const spyon = jest.spyOn(Auth, 'completeNewPassword').mockImplementationOnce(() => {
                return new Promise((res, rej) => {
                    rej('err');
                });
            });
            const spyon2 = jest.spyOn(RequireNewPassword.prototype, 'error').mockImplementationOnce(() => { return; });

            const wrapper = shallow(<RequireNewPassword/>);
            const requireNewPassword = wrapper.instance();

            wrapper.setProps(props);
            requireNewPassword.inputs = {
                password: 'password'
            }

            await requireNewPassword.change();

            spyon.mockClear();
            spyon2.mockClear();
        });
    });
});

