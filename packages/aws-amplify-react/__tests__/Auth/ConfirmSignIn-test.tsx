import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { ConfirmSignIn } from '../../src/Auth/ConfirmSignIn';
import AmplifyTheme from '../../src/AmplifyTheme';
import {
	Input,
	Button,
	Link,
} from '../../src/Amplify-UI/Amplify-UI-Components-React';

const acceptedStates = ['confirmSignIn'];

const deniedStates = [
	'signIn',
	'signedUp',
	'signedOut',
	'signUp',
	'signedIn',
	'confirmSignUp',
	'forgotPassword',
	'verifyContact',
];

const fakeEvent = {
	preventDefault: jest.fn(),
};

describe('ConfirmSignIn', () => {
	describe('render test', () => {
		test('render correctly with Props confirmSignIn', () => {
			const wrapper = shallow(<ConfirmSignIn />);
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: AmplifyTheme,
				});
				expect(wrapper).toMatchSnapshot();
			}
		});

		test('render corrently with other authstate', () => {
			const wrapper = shallow(<ConfirmSignIn />);

			for (let i = 0; i < deniedStates.length; i += 1) {
				wrapper.setProps({
					authState: deniedStates[i],
					theme: AmplifyTheme,
				});

				expect(wrapper).toMatchSnapshot();
			}
		});

		test('hidden if hide include confirmSignIn', () => {
			const wrapper = shallow(<ConfirmSignIn />);
			wrapper.setProps({
				authState: acceptedStates[0],
				hide: [ConfirmSignIn],
			});
			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('confirm test', () => {
		test('user with challengeName SOFTWARE_TOKEN_MFA', async () => {
			const wrapper = shallow(<ConfirmSignIn />);

			const spyon = jest
				.spyOn(Auth, 'confirmSignIn')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			wrapper.setProps({
				authState: acceptedStates[0],
				theme: AmplifyTheme,
				authData: {
					user: {
						challengeName: 'SOFTWARE_TOKEN_MFA',
					},
				},
			});

			const confirmSignIn = wrapper.instance();

			await confirmSignIn.confirm();

			expect(spyon).toBeCalled();

			spyon.mockClear();
		});
	});

	describe('normal case', () => {
		test('simulate clicking confirm button', async () => {
			const spyon = jest
				.spyOn(Auth, 'confirmSignIn')
				.mockImplementation((user, code) => {
					return new Promise((res, rej) => {
						res();
					});
				});

			const wrapper = shallow(<ConfirmSignIn />);
			const spyon2 = jest.spyOn(wrapper.instance(), 'checkContact');
			wrapper.setProps({
				authState: acceptedStates[0],
				theme: AmplifyTheme,
				authData: 'user',
			});

			const event_code = {
				target: {
					name: 'code',
					value: '123456',
				},
			};

			wrapper
				.find(Input)
				.at(0)
				.simulate('change', event_code);
			wrapper
				.find('form')
				.at(0)
				.simulate('submit', fakeEvent);

			await Promise.resolve();

			expect.assertions(3);
			expect(spyon.mock.calls[0][0]).toBe('user');
			expect(spyon.mock.calls[0][1]).toBe('123456');
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('back to sign in', () => {
			const wrapper = shallow(<ConfirmSignIn />);
			const spyon2 = jest.spyOn(wrapper.instance(), 'changeState');
			wrapper.setProps({
				authState: acceptedStates[0],
				theme: AmplifyTheme,
				authData: 'user',
			});

			wrapper
				.find(Link)
				.at(0)
				.simulate('click');
			expect(spyon2).toBeCalledWith('signIn');

			spyon2.mockClear();
		});
	});

	describe('checkContact test', () => {
		test('contact verified', async () => {
			const wrapper = shallow(<ConfirmSignIn />);
			const confirmSignIn = wrapper.instance();

			const spyon = jest
				.spyOn(Auth, 'verifiedContact')
				.mockImplementationOnce(() => {
					return Promise.resolve({
						verified: {
							email: 'xxx@xxx.com',
						},
					});
				});

			const spyon2 = jest.spyOn(confirmSignIn, 'changeState');

			await confirmSignIn.checkContact({
				user: 'user',
			});

			expect(spyon2).toBeCalledWith('signedIn', { user: 'user' });

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('contact not verified', async () => {
			const wrapper = shallow(<ConfirmSignIn />);
			const confirmSignIn = wrapper.instance();

			const spyon = jest
				.spyOn(Auth, 'verifiedContact')
				.mockImplementationOnce(() => {
					return Promise.resolve({
						verified: {},
					});
				});

			const spyon2 = jest.spyOn(confirmSignIn, 'changeState');

			await confirmSignIn.checkContact({
				user: 'user',
			});

			expect(spyon2).toBeCalledWith('verifyContact', {
				user: 'user',
				verified: {},
			});

			spyon.mockClear();
			spyon2.mockClear();
		});
	});
});
