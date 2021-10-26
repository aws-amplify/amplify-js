import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { SignOut } from '../../src/Auth/SignOut';
import { Hub } from '@aws-amplify/core';
import * as AmplifyMocks from '../../__mocks__/amplifyMock';

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

describe('SignOut', () => {
	describe('normal case', () => {
		test('render correctly with authState signedIn', () => {
			const wrapper = shallow(<SignOut />);
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: 'theme',
				});
				expect(wrapper).toMatchSnapshot();
			}
		});

		test('render correctly with hide', () => {
			const wrapper = shallow(<SignOut />);
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: 'theme',
					hide: [SignOut],
				});
				expect(wrapper).toMatchSnapshot();
			}
		});

		test('render correctly with empty hide', () => {
			const wrapper = shallow(<SignOut />);
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: 'theme',
					hide: [],
				});
				expect(wrapper).toMatchSnapshot();
			}
		});
	});

	test('render correctly with other authStates', () => {
		const wrapper = shallow(<SignOut />);

		for (let i = 0; i < deniedStates.length; i += 1) {
			wrapper.setProps({
				authState: deniedStates[i],
				theme: 'theme',
			});

			expect(wrapper).toMatchSnapshot();
		}
	});

	describe('signOut test', () => {
		test('happy case (without stateFromStorage)', async () => {
			const wrapper = shallow(<SignOut />);
			const signOut = wrapper.instance();

			const spyon = jest.spyOn(Auth, 'signOut').mockImplementationOnce(() => {
				return Promise.resolve();
			});

			await signOut.signOut();

			expect(spyon).toBeCalled();
			spyon.mockClear();
		});

		test('happy case (with stateFromStorage)', async () => {
			const wrapper = shallow(<SignOut />);
			const signOut = wrapper.instance();

			signOut.state.stateFromStorage = true;

			const spyon = jest.spyOn(Auth, 'signOut').mockImplementationOnce(() => {
				return Promise.resolve();
			});

			await signOut.signOut();

			expect(spyon).toBeCalled();
			spyon.mockClear();
		});

		test('error case', async () => {
			const wrapper = shallow(<SignOut />);
			const signOut = wrapper.instance();

			const spyon = jest.spyOn(Auth, 'signOut').mockImplementationOnce(() => {
				return Promise.reject('error');
			});

			await signOut.signOut();

			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('onHubCapsule tests', () => {
		test('onHubCapsule is present', () => {
			const signOut = mount(<SignOut />).instance();
			expect(signOut.onHubCapsule).toBeTruthy();
		});
		test('onHubCapsule is called on a Hub event', () => {
			const spy = jest.spyOn(SignOut.prototype, 'onHubCapsule');
			mount(<SignOut />).instance();
			Hub.dispatch('auth', { event: 'test' });
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
		});
		test('onHubCapsule should setState with authState = "signedIn" when "signIn" auth event fires', () => {
			const spy = jest.spyOn(SignOut.prototype, 'setState');
			mount(<SignOut />).instance();
			Hub.dispatch('auth', { event: 'signIn', data: { foo: 'bar' } });
			expect(spy).toHaveBeenCalledWith({
				authState: 'signedIn',
				authData: { foo: 'bar' },
			});
			spy.mockClear();
		});
		test('onHubCapsule should setState with authState = "signIn" when "customSignOut" auth event fires', () => {
			const spy = jest.spyOn(SignOut.prototype, 'setState');
			mount(<SignOut />).instance();
			Hub.dispatch('auth', { event: 'signOut' });
			expect(spy).toHaveBeenCalledWith({
				authState: 'signIn',
			});
			spy.mockClear();
		});
	});

	describe('findState tests', () => {
		test('findState is called', () => {
			const spy = jest.spyOn(SignOut.prototype, 'findState');
			mount(<SignOut />).instance();
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
			const wrapper = shallow(<SignOut {...props} />);
			wrapper.instance();
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
			const wrapper = shallow(<SignOut {...props} />);
			wrapper.instance();
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
		});
		test('Auth.currentAuthenticatedUser results in state being set', async () => {
			const spy = jest.spyOn(SignOut.prototype, 'setState');
			const props = {};
			const wrapper = shallow(<SignOut {...props} />);
			const signOut = wrapper.instance();
			await signOut.findState();
			expect(signOut.state.stateFromStorage).toEqual(true);
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
		});
	});

	describe('SignOut lifecycle', () => {
		test('componentDidMount', async () => {
			const spy = jest.spyOn(SignOut.prototype, 'componentDidMount');
			const signOut = mount(<SignOut />).instance();
			signOut.componentDidMount();
			expect(signOut._isMounted).toBeTruthy();
			expect(spy).toHaveBeenCalled();
			spy.mockClear();
		});
		test('componentWillUnmount', async () => {
			const wrapper = shallow(<SignOut />);
			const signOut = wrapper.instance();
			const componentWillUnmount = jest.spyOn(signOut, 'componentWillUnmount');
			wrapper.unmount();
			expect(signOut._isMounted).toBeFalsy();
			expect(componentWillUnmount).toHaveBeenCalled();
		});
	});
});
