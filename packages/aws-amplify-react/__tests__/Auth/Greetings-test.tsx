import { Auth } from '@aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
import * as React from 'react';
import { Greetings } from '../../src/Auth/Greetings';

const acceptedStates = ['signedIn'];

const deniedStates = [
	'signIn',
	'signedUp',
	'signedOut',
	'forgotPassword',
	'signUp',
	'confirmSignIn',
	'confirmSignUp',
	'verifyContact',
];

describe('Greetings', () => {
	describe('normal case', () => {
		test('render correctly with authState signedIn', () => {
			const wrapper = shallow(<Greetings />);
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					authData: {
						attributes: {
							name: 'username',
						},
					},
					theme: 'theme',
				});
				expect(wrapper).toMatchSnapshot();
			}
		});

		test('render correctly with hide', () => {
			const wrapper = shallow(<Greetings />);
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: 'theme',
					hide: [Greetings],
				});
				expect(wrapper).toMatchSnapshot();
			}
		});
	});

	test('render corrently with other authStates', () => {
		const wrapper = shallow(<Greetings />);

		for (let i = 0; i < deniedStates.length; i += 1) {
			wrapper.setProps({
				authState: deniedStates[i],
				theme: 'theme',
			});

			expect(wrapper).toMatchSnapshot();
		}
	});

	describe('Greetings lifecycle', () => {
		test('componentDidMount', async () => {
			const spy = jest.spyOn(Greetings.prototype, 'componentDidMount');
			const greetings = mount(<Greetings />).instance();
			greetings.componentDidMount();
			expect(greetings._isMounted).toBeTruthy();
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
		});
		test('componentWillUnmount', async () => {
			const wrapper = shallow(<Greetings />);
			const greetings = wrapper.instance();
			const componentWillUnmount = jest.spyOn(
				greetings,
				'componentWillUnmount'
			);
			wrapper.unmount();
			expect(greetings._isMounted).toBeFalsy();
			expect(componentWillUnmount).toHaveBeenCalled();
		});
	});

	describe('findState tests', () => {
		test('findState is called', () => {
			const spy = jest.spyOn(Greetings.prototype, 'findState');
			const greetings = mount(<Greetings />).instance();
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
		});
		test('Auth.currentAuthenticatedUser is not called if auth props are present', () => {
			const spy = jest
				.spyOn(Auth, 'currentAuthenticatedUser')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res({
							user: {},
						});
					});
				});
			const props = {
				authState: 'signedIn',
				authData: {},
			};
			const wrapper = shallow(<Greetings {...props} />);
			const greetings = wrapper.instance();
			expect(spy).not.toHaveBeenCalled();
			spy.mockClear();
		});
		test('Auth.currentAuthenticatedUser is called if auth props are not present', () => {
			const spy = jest
				.spyOn(Auth, 'currentAuthenticatedUser')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res({
							user: {},
						});
					});
				});
			const props = {};
			const wrapper = shallow(<Greetings {...props} />);
			const greetings = wrapper.instance();
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
		});
		test('Auth.currentAuthenticatedUser results in state being set', async () => {
			const spy = jest.spyOn(Greetings.prototype, 'setState');
			const props = {};
			const wrapper = shallow(<Greetings {...props} />);
			const greetings = wrapper.instance();
			await greetings.findState();
			expect(greetings.state.stateFromStorage).toEqual(true);
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
		});
	});

	describe('onHubCapsule tests', () => {
		test('onHubCapsule is present', () => {
			const greetings = mount(<Greetings />).instance();
			expect(greetings.onHubCapsule).toBeTruthy();
		});
		test('onHubCapsule is called on a Hub event', () => {
			const spy = jest.spyOn(Greetings.prototype, 'onHubCapsule');
			const greetings = mount(<Greetings />).instance();
			Hub.dispatch('auth', { event: 'test' });
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
		});
		test('onHubCapsule should setState with authState = "signedIn" when "signIn" auth event fires', () => {
			const spy = jest.spyOn(Greetings.prototype, 'setState');
			const greetings = mount(<Greetings />).instance();
			Hub.dispatch('auth', { event: 'signIn', data: { foo: 'bar' } });
			expect(spy).toHaveBeenCalledWith({
				authState: 'signedIn',
				authData: { foo: 'bar' },
			});
			spy.mockClear();
		});
		test('onHubCapsule should setState with authState = "signIn" when "customSignOut" auth event fires', () => {
			const spy = jest.spyOn(Greetings.prototype, 'setState');
			const greetings = mount(<Greetings />).instance();
			Hub.dispatch('auth', { event: 'signOut' });
			expect(spy).toHaveBeenCalledWith({
				authState: 'signIn',
			});
			spy.mockClear();
		});
	});
});
