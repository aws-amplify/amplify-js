import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { SignUp } from '../../src/Auth/SignUp';
import AmplifyTheme from '../../src/AmplifyTheme';
import {
	Input,
	Button,
	InputLabel,
} from '../../src/Amplify-UI/Amplify-UI-Components-React';
import { PhoneField } from '../../src/Auth/PhoneField';

const acceptedStates = ['signUp'];

const deniedStates = [
	'signIn',
	'signedUp',
	'signedOut',
	'forgotPassword',
	'signedIn',
	'confirmSignIn',
	'confirmSignUp',
	'verifyContact',
];

const mockResult = {
	user: {
		username: 'testuser',
	},
};

describe('signUp without signUpConfig prop', () => {
	describe('normal case', () => {
		const wrapper = shallow(<SignUp />);

		test('render correctly with authState signUp', () => {
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: AmplifyTheme,
				});
				expect(wrapper).toMatchSnapshot();
			}
		});

		test('render correctly with hide', () => {
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: AmplifyTheme,
					hide: [SignUp],
				});
				expect(wrapper).toMatchSnapshot();
			}
		});

		test('when clicking signUp', async () => {
			const wrapper = shallow(<SignUp />);
			wrapper.setProps({
				authState: 'signUp',
				theme: AmplifyTheme,
			});

			const spyon = jest
				.spyOn(Auth, 'signUp')
				.mockImplementationOnce((user, password) => {
					return new Promise((res, rej) => {
						res(mockResult);
					});
				});

			const spyon_changeState = jest.spyOn(wrapper.instance(), 'changeState');

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

			const event_email = {
				target: {
					name: 'email',
					value: 'email@amazon.com',
				},
			};
			const phone_number = '+12345678999';

			wrapper
				.find(Input)
				.at(0)
				.simulate('change', event_username);
			wrapper
				.find(Input)
				.at(1)
				.simulate('change', event_password);
			wrapper
				.find(Input)
				.at(2)
				.simulate('change', event_email);
			wrapper
				.find(PhoneField)
				.at(0)
				.simulate('changeText', phone_number);
			await wrapper.find(Button).simulate('click');

			expect(spyon).toBeCalledWith({
				attributes: { email: 'email@amazon.com', phone_number: '+12345678999' },
				password: 'abc',
				username: 'user1',
			});
			expect(spyon_changeState).toBeCalled();
			expect(spyon_changeState.mock.calls[0][0]).toBe('confirmSignUp');

			spyon.mockClear();
			spyon_changeState.mockClear();
		});

		test('state.requestPending should be true when signUp execution begins', () => {
			const wrapper = shallow(<SignUp />);
			wrapper.setProps({
				authState: 'signUp',
				theme: AmplifyTheme,
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

			const event_email = {
				target: {
					name: 'email',
					value: 'email@amazon.com',
				},
			};
			const phone_number = '+12345678999';

			wrapper
				.find(Input)
				.at(0)
				.simulate('change', event_username);
			wrapper
				.find(Input)
				.at(1)
				.simulate('change', event_password);
			wrapper
				.find(Input)
				.at(2)
				.simulate('change', event_email);
			wrapper
				.find(PhoneField)
				.at(0)
				.simulate('changeText', phone_number);

			const button = wrapper.find(Button);
			expect(button.props().disabled).toEqual(false);
			expect(wrapper.state().requestPending).toEqual(false);

			button.simulate('click');
			expect(wrapper.state().requestPending).toEqual(true);
		});

		test('the signup button should be disabled when state.requestPending is true', async () => {
			const wrapper = shallow(<SignUp />);
			wrapper.setProps({
				authState: 'signUp',
				theme: AmplifyTheme,
			});

			wrapper.setState({
				requestPending: true,
			});

			expect(
				wrapper
					.update()
					.find(Button)
					.props().disabled
			).toEqual(true);
		});

		test('when clicking signUp with another format of phone number', async () => {
			const wrapper = shallow(<SignUp />);
			wrapper.setProps({
				authState: 'signUp',
				theme: AmplifyTheme,
			});

			const spyon = jest
				.spyOn(Auth, 'signUp')
				.mockImplementationOnce((user, password) => {
					return new Promise((res, rej) => {
						res(mockResult);
					});
				});

			const spyon_changeState = jest.spyOn(wrapper.instance(), 'changeState');

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

			const event_email = {
				target: {
					name: 'email',
					value: 'email@amazon.com',
				},
			};

			const phone_number = '+12345678901';

			wrapper
				.find(Input)
				.at(0)
				.simulate('change', event_username);
			wrapper
				.find(Input)
				.at(1)
				.simulate('change', event_password);
			wrapper
				.find(Input)
				.at(2)
				.simulate('change', event_email);
			wrapper
				.find(PhoneField)
				.at(0)
				.simulate('changeText', phone_number);
			await wrapper.find(Button).simulate('click');

			expect(spyon).toBeCalledWith({
				attributes: { email: 'email@amazon.com', phone_number: '+12345678901' },
				password: 'abc',
				username: 'user1',
			});

			expect(spyon_changeState).toBeCalled();
			expect(spyon_changeState.mock.calls[0][0]).toBe('confirmSignUp');

			spyon.mockClear();
			spyon_changeState.mockClear();
		});

		test('when clicking signUp without phone_number', async () => {
			const wrapper = shallow(<SignUp />);
			wrapper.setProps({
				authState: 'signUp',
				theme: AmplifyTheme,
			});

			const spyon = jest
				.spyOn(Auth, 'signUp')
				.mockImplementationOnce((user, password) => {
					return new Promise((res, rej) => {
						res(mockResult);
					});
				});

			const spyon_changeState = jest.spyOn(wrapper.instance(), 'changeState');

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

			const event_email = {
				target: {
					name: 'email',
					value: 'email@amazon.com',
				},
			};

			const phone_number = undefined;

			wrapper
				.find(Input)
				.at(0)
				.simulate('change', event_username);
			wrapper
				.find(Input)
				.at(1)
				.simulate('change', event_password);
			wrapper
				.find(Input)
				.at(2)
				.simulate('change', event_email);
			wrapper
				.find(PhoneField)
				.at(0)
				.simulate('changeText', phone_number);
			await wrapper.find(Button).simulate('click');

			expect(spyon).not.toBeCalled();

			spyon.mockClear();
			spyon_changeState.mockClear();
		});
	});

	describe('null case with other authState', () => {
		test('render corrently', () => {
			const wrapper = shallow(<SignUp />);

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

describe('signUp with signUpConfig', () => {
	let wrapper;
	beforeEach(() => {
		wrapper = shallow(<SignUp />);
	});

	test('render correctly with authState signUp', () => {
		for (var i = 0; i < acceptedStates.length; i += 1) {
			wrapper.setProps({
				authState: acceptedStates[i],
				theme: AmplifyTheme,
				signUpConfig: {
					signUpFields: [
						{
							key: 'address',
							label: 'Address',
							required: true,
						},
					],
				},
			});
			expect(wrapper).toMatchSnapshot();
		}
	});

	test('render correctly with hide', () => {
		for (var i = 0; i < acceptedStates.length; i += 1) {
			wrapper.setProps({
				authState: acceptedStates[i],
				theme: AmplifyTheme,
				hide: [SignUp],
				signUpConfig: {
					signUpFields: [
						{
							key: 'address',
							label: 'Address',
							required: true,
						},
					],
				},
			});
			expect(wrapper).toMatchSnapshot();
		}
	});

	test('expect custom field to be last if display order not defined', () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				signUpFields: [
					{
						key: 'address',
						label: 'Address',
						required: true,
					},
				],
			},
		});
		const addressElementFound = wrapper.find({ name: 'address' });
		const addressChildFound = wrapper.find(Input).at(3);
		expect(addressElementFound.props().name).toEqual(
			addressChildFound.props().name
		);
	});

	test('expect custom field to be first if display order is defined as 1, and it is prior to username alpabetically', () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				signUpFields: [
					{
						key: 'address',
						label: 'Address',
						required: true,
						displayOrder: 1,
					},
				],
			},
		});
		const addressElementFound = wrapper.find({ name: 'address' });
		const addressChildFound = wrapper.find(Input).at(0);
		expect(addressElementFound.props().name).toEqual(
			addressChildFound.props().name
		);
	});

	test('expect custom field to be second if display order is defined as 1, and it is after username alpabetically', () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				signUpFields: [
					{
						key: 'z',
						label: 'Z',
						required: true,
						displayOrder: 1,
					},
				],
			},
		});
		const addressElementFound = wrapper.find({ name: 'z' });
		const addressChildFound = wrapper.find(Input).at(1);
		expect(addressElementFound.props().name).toEqual(
			addressChildFound.props().name
		);
	});

	test('expect 5 fields to be present if hideAllDefaults is undefined', () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				signUpFields: [
					{
						key: 'z',
						label: 'Z',
						required: true,
						displayOrder: 1,
					},
				],
			},
		});
		expect(wrapper.find(Input).length).toEqual(4);
		expect(wrapper.find(PhoneField).length).toEqual(1);
	});

	test('expect 5 fields to be present if hideAllDefaults is false', () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				hideAllDefaults: false,
				signUpFields: [
					{
						key: 'z',
						label: 'Z',
						required: true,
						displayOrder: 1,
					},
				],
			},
		});
		expect(wrapper.find(Input).length).toEqual(4);
		expect(wrapper.find(PhoneField).length).toEqual(1);
	});

	test('expect custom field to be the only field if hideAllDefaults is true', () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				hideAllDefaults: true,
				signUpFields: [
					{
						key: 'z',
						label: 'Z',
						required: true,
						displayOrder: 1,
					},
				],
			},
		});
		expect(wrapper.find(Input).length).toEqual(1);
	});

	test('expect default username to be overwritten if username field passed in via signUpConfig', () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				signUpFields: [
					{
						key: 'z',
						label: 'Z',
						required: true,
					},
					{
						key: 'username',
						label: 'NEW USERNAME LABEL',
						required: true,
					},
				],
			},
		});

		const signup = new SignUp();
		const defaultUsernameLabel = signup.defaultSignUpFields.find(i => {
			return i.key === 'username';
		}).label;

		const customUsername = wrapper.find(InputLabel).findWhere(el => {
			return el.text() === 'NEW USERNAME LABEL';
		});

		const originalUsername = wrapper.find(InputLabel).findWhere(el => {
			return el.text() === defaultUsernameLabel;
		});

		expect(customUsername.length).toEqual(1);
		expect(originalUsername.length).toEqual(0);
	});

	test('default dial code should be set to passed defaultCountryCode', () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				defaultCountryCode: '51',
				signUpFields: [
					{
						key: 'z',
						label: 'Z',
						required: true,
					},
					{
						key: 'username',
						label: 'NEW USERNAME LABEL',
						required: true,
					},
				],
			},
		});

		let phoneField = wrapper.find(PhoneField).at(0);
		expect(phoneField.props().defaultDialCode).toEqual('+51');
	});

	test('signUp should not complete if required field is not filled out', async () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				defaultCountryCode: '51',
				signUpFields: [
					{
						key: 'z',
						label: 'Z',
						required: true,
					},
					{
						key: 'username',
						label: 'NEW USERNAME LABEL',
						required: true,
					},
				],
			},
		});

		const spyon = jest
			.spyOn(Auth, 'signUp')
			.mockImplementationOnce((user, password) => {
				return new Promise((res, rej) => {
					res(mockResult);
				});
			});

		const spyon_changeState = jest.spyOn(wrapper.instance(), 'changeState');

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

		const event_email = {
			target: {
				name: 'email',
				value: 'email@amazon.com',
			},
		};
		const event_phone = {
			target: {
				name: 'phone_line_number',
				value: '2345678999',
			},
		};
		const dial_code = {
			target: {
				name: 'dial_code',
				value: '+1',
			},
		};

		wrapper
			.find(Input)
			.at(0)
			.simulate('change', event_username);
		wrapper
			.find(Input)
			.at(1)
			.simulate('change', event_password);
		wrapper
			.find(Input)
			.at(2)
			.simulate('change', event_email);
		wrapper
			.find(Input)
			.at(3)
			.simulate('change', event_phone);
		await wrapper.find(Button).simulate('click');

		expect(spyon).not.toBeCalled();
	});

	test('signUp should  complete if optional field is not filled out', async () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				defaultCountryCode: '51',
				signUpFields: [
					{
						key: 'z',
						label: 'Z',
						required: false,
					},
					{
						key: 'username',
						label: 'NEW USERNAME LABEL',
						required: true,
					},
				],
			},
		});

		const spyon = jest
			.spyOn(Auth, 'signUp')
			.mockImplementationOnce((user, password) => {
				return new Promise((res, rej) => {
					res(mockResult);
				});
			});

		const spyon_changeState = jest.spyOn(wrapper.instance(), 'changeState');

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

		const event_email = {
			target: {
				name: 'email',
				value: 'email@amazon.com',
			},
		};
		const phone_number = '+12345678999';

		wrapper
			.find(Input)
			.at(0)
			.simulate('change', event_username);
		wrapper
			.find(Input)
			.at(1)
			.simulate('change', event_password);
		wrapper
			.find(Input)
			.at(2)
			.simulate('change', event_email);
		wrapper
			.find(PhoneField)
			.at(0)
			.simulate('changeText', phone_number);
		await wrapper.find(Button).simulate('click');

		expect(spyon).toBeCalled();
	});

	test('signUp should  complete if required field is filled out', async () => {
		wrapper.setProps({
			authState: 'signUp',
			theme: AmplifyTheme,
			signUpConfig: {
				defaultCountryCode: '51',
				signUpFields: [
					{
						key: 'z',
						label: 'Z',
						required: true,
					},
					{
						key: 'username',
						label: 'NEW USERNAME LABEL',
						required: true,
					},
				],
			},
		});

		const spyon = jest
			.spyOn(Auth, 'signUp')
			.mockImplementationOnce((user, password) => {
				return new Promise((res, rej) => {
					res(mockResult);
				});
			});

		const spyon_changeState = jest.spyOn(wrapper.instance(), 'changeState');

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

		const event_email = {
			target: {
				name: 'email',
				value: 'email@amazon.com',
			},
		};
		const phone_number = '+12345678999';
		const event_z = {
			target: {
				name: 'z',
				value: '1',
			},
		};

		wrapper
			.find(Input)
			.at(0)
			.simulate('change', event_username);
		wrapper
			.find(Input)
			.at(1)
			.simulate('change', event_password);
		wrapper
			.find(Input)
			.at(2)
			.simulate('change', event_email);
		wrapper
			.find(PhoneField)
			.at(0)
			.simulate('changeText', phone_number);
		wrapper
			.find(Input)
			.at(3)
			.simulate('change', event_z);
		await wrapper.find(Button).simulate('click');

		expect(spyon).toBeCalled();
	});

	test('signUp should complete even if phone field is hidden', async () => {
		wrapper.setProps({
			authState: 'signUp',
			signUpConfig: {
				hiddenDefaults: ['phone_number'],
			},
		});

		const spyon = jest
			.spyOn(Auth, 'signUp')
			.mockImplementationOnce((user, password) => {
				return new Promise((res, rej) => {
					res(mockResult);
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

		const event_email = {
			target: {
				name: 'email',
				value: 'email@amazon.com',
			},
		};

		wrapper
			.find(Input)
			.at(0)
			.simulate('change', event_username);
		wrapper
			.find(Input)
			.at(1)
			.simulate('change', event_password);
		wrapper
			.find(Input)
			.at(2)
			.simulate('change', event_email);
		await wrapper.find(Button).simulate('click');

		expect(spyon).toBeCalled();
	});
});
