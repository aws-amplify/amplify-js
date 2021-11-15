import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { ConfirmSignUp } from '../../src/Auth/ConfirmSignUp';
import AmplifyTheme from '../../src/AmplifyTheme';
import {
	Input,
	Button,
	Link,
} from '../../src/Amplify-UI/Amplify-UI-Components-React';

const acceptedStates = ['confirmSignUp'];

const deniedStates = [
	'signIn',
	'signedUp',
	'signedOut',
	'signUp',
	'signedIn',
	'confirmSignIn',
	'forgotPassword',
	'verifyContact',
];

describe('ConfirmSignIn', () => {
	describe('normal case', () => {
		test('render correctly with Props confirmSignUp', () => {
			const wrapper = shallow(<ConfirmSignUp />);
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: AmplifyTheme,
				});
				expect(wrapper).toMatchSnapshot();
			}
		});

		test('render correctly with hide', () => {
			const wrapper = shallow(<ConfirmSignUp />);
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: AmplifyTheme,
					hide: [ConfirmSignUp],
				});
				expect(wrapper).toMatchSnapshot();
			}
		});

		test('simulate clicking confirm button with username already defined in auth data', async () => {
			const spyon = jest
				.spyOn(Auth, 'confirmSignUp')
				.mockImplementation((user, code) => {
					return new Promise((res, rej) => {
						res();
					});
				});

			const spyon3 = jest
				.spyOn(ConfirmSignUp.prototype, 'usernameFromAuthData')
				.mockImplementation(() => {
					return 'user';
				});

			const wrapper = shallow(<ConfirmSignUp />);
			const spyon2 = jest.spyOn(wrapper.instance(), 'changeState');
			wrapper.setProps({
				authState: acceptedStates[0],
				theme: AmplifyTheme,
				hide: false,
			});

			const event_code = {
				target: {
					name: 'code',
					value: '123456',
				},
			};

			wrapper.find(Input).at(0).simulate('change', event_code);
			await wrapper.find(Button).at(0).simulate('click');

			expect.assertions(2);
			expect(spyon).toBeCalledWith('user', '123456');
			expect(spyon2).toBeCalledWith('signedUp');

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
		});

		test('simulate clicking resend button with username already defined in auth data', async () => {
			const spyon = jest
				.spyOn(Auth, 'resendSignUp')
				.mockImplementation((user) => {
					return new Promise((res, rej) => {
						res();
					});
				});

			const spyon3 = jest
				.spyOn(ConfirmSignUp.prototype, 'usernameFromAuthData')
				.mockImplementation(() => {
					return 'user';
				});

			const wrapper = shallow(<ConfirmSignUp />);

			wrapper.setProps({
				authState: acceptedStates[0],
				theme: AmplifyTheme,
				hide: false,
			});

			const event_code = {
				target: {
					name: 'code',
					value: '123456',
				},
			};

			const event_username = {
				target: {
					name: 'username',
					value: 'user1',
				},
			};

			await wrapper.find(Link).at(0).simulate('click');

			expect.assertions(1);
			expect(spyon).toBeCalledWith('user');

			spyon.mockClear();
		});
	});

	describe('null case with other authState', () => {
		test('render corrently', () => {
			const wrapper = shallow(<ConfirmSignUp />);

			for (let i = 0; i < deniedStates.length; i += 1) {
				wrapper.setProps({
					authState: deniedStates[i],
					theme: AmplifyTheme,
				});

				expect(wrapper).toMatchSnapshot();
			}
		});
	});
});
