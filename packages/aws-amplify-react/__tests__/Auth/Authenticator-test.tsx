import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { Authenticator, EmptyContainer } from '../../src/Auth/Authenticator';
import { SignIn } from '../../src/Auth/SignIn';
import AmplifyTheme from '../../src/AmplifyTheme';
import {
	Button,
	InputRow,
	Container,
} from '../../src/Amplify-UI/Amplify-UI-Components-React';

const waitForResolve = Promise.resolve();

describe('Authenticator', () => {
	beforeAll(() => {
		const localStorageMock = {
			getItem: jest.fn(),
			setItem: jest.fn(),
			removeItem: jest.fn(),
			clear: jest.fn(),
		};
		global.localStorage = localStorageMock;
	});
	afterAll(() => {
		jest.resetAllMocks();
	});
	describe('normal case', () => {
		test('render if no error', () => {
			const wrapper = shallow(<Authenticator />);
			wrapper.setProps({
				authState: 'signIn',
				theme: AmplifyTheme,
			});
			expect(wrapper).toMatchSnapshot();
		});

		test('render with hidedefault', () => {
			const wrapper = shallow(<Authenticator hidedefault />);
			wrapper.setProps({
				authState: 'signIn',
				theme: AmplifyTheme,
			});
			expect(wrapper).toMatchSnapshot();
		});

		test('render if no error with children', () => {
			const wrapper = shallow(
				<Authenticator>
					<div></div>
				</Authenticator>
			);
			wrapper.setProps({
				authState: 'signIn',
				theme: AmplifyTheme,
			});
			expect(wrapper).toMatchSnapshot();
		});
	});

	describe.skip('handleStateChange test', () => {
		test('when user sign in and need confirmation', async () => {
			const wrapper = shallow(<Authenticator />);

			const spyon = jest
				.spyOn(Auth, 'signIn')
				.mockImplementationOnce((user, password) => {
					return new Promise((res, rej) => {
						res({
							challengeName: 'SMS_MFA',
						});
					});
				});

			const event_username = {
				target: {
					name: 'username',
					value: 'user1',
				},
			};
			const event_password = {
				target: {
					name: 'password',
					value: 'abc',
				},
			};

			const signInWrapper = wrapper.find(SignIn).dive();
			signInWrapper
				.find(InputRow)
				.at(0)
				.simulate('change', event_username);
			signInWrapper
				.find(InputRow)
				.at(1)
				.simulate('change', event_password);
			await signInWrapper.find(Button).simulate('click');

			expect(wrapper.state()).toEqual({
				auth: 'confirmSignIn',
				authData: { challengeName: 'SMS_MFA' },
				error: null,
			});

			spyon.mockClear();
		});
	});

	describe.skip('handleAuthEvent test', () => {
		test('when user sign in failed', async () => {
			const wrapper = shallow(<Authenticator />);

			const spyon = jest
				.spyOn(Auth, 'signIn')
				.mockImplementationOnce((user, password) => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			const event_username = {
				target: {
					name: 'username',
					value: 'user1',
				},
			};
			const event_password = {
				target: {
					name: 'password',
					value: 'abc',
				},
			};

			const signInWrapper = wrapper.find(SignIn).dive();
			signInWrapper
				.find(Input)
				.at(0)
				.simulate('change', event_username);
			signInWrapper
				.find(Input)
				.at(1)
				.simulate('change', event_password);
			await signInWrapper.find(Button).simulate('click');

			expect(wrapper.state()).toEqual({
				auth: 'signIn',
			});

			spyon.mockClear();
		});
	});

	describe('checkUser test', () => {
		test('happy case', async () => {
			const wrapper = shallow(<Authenticator />);
			const authenticator = wrapper.instance();

			const spyon = jest
				.spyOn(Auth, 'currentAuthenticatedUser')
				.mockImplementationOnce(() => {
					return Promise.resolve('user');
				});

			await authenticator.checkUser();

			expect(spyon).toBeCalled();
		});
	});

	describe('container component', () => {
		test('use provided Container component if this.props.container is truthy', () => {
			const CustomContainer = ({ children }) => {
				return <div className="custom-container">{children}</div>;
			};
			const wrapper = mount(<Authenticator container={CustomContainer} />);
			expect(wrapper.childAt(0).type()).toBe(CustomContainer);
		});

		test('use AWS Amplify UI Container if this.props.container is undefined', () => {
			const wrapper = mount(<Authenticator />);
			expect(wrapper.childAt(0).type()).toBe(Container);
		});

		test('use EmptyContainer if this.props.container is falsey', () => {
			const wrapper = mount(<Authenticator container="" />);
			expect(wrapper.childAt(0).type()).toBe(EmptyContainer);
		});
	});
});
