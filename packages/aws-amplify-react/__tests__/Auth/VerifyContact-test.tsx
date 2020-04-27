import { Auth } from '@aws-amplify/auth';
import { VerifyContact } from '../../src/Auth/VerifyContact';
import * as React from 'react';
import { Button, Link } from '../../src/Amplify-UI/Amplify-UI-Components-React';

const acceptedStates = ['verifyContact'];

const deniedStates = [
	'signIn',
	'signedUp',
	'signedOut',
	'forgotPassword',
	'signedIn',
	'confirmSignIn',
	'confirmSignUp',
	'signUp',
];

describe.only('VerifyContent test', () => {
	describe('render test', () => {
		test('render with accepted states', () => {
			const wrapper = shallow(<VerifyContact />);
			for (let i = 0; i < acceptedStates.length; i += 1) {
				wrapper.setProps({
					authState: acceptedStates[i],
					theme: 'theme',
					authData: {
						unverified: {
							email: 'email@amazon.com',
							phone_number: '+12345678901',
						},
					},
				});
				expect(wrapper).toMatchSnapshot();
			}
		});

		test('render submitView if verifyAttr is set', () => {
			const wrapper = shallow(<VerifyContact />);
			const props = {
				authState: 'verifyContact',
				theme: 'theme',
			};
			wrapper.setProps(props);
			wrapper.setState({ verifyAttr: true });

			expect(wrapper).toMatchSnapshot();
		});

		test('render verifyView with empty authData', () => {
			const wrapper = shallow(<VerifyContact />);
			const props = {
				authState: 'verifyContact',
				theme: 'theme',
				authData: {},
			};
			wrapper.setProps(props);

			expect(wrapper).toMatchSnapshot();
		});

		test('render verifyView without phone_number and email', () => {
			const wrapper = shallow(<VerifyContact />);
			const props = {
				authState: 'verifyContact',
				theme: 'theme',
				authData: {
					unverified: {},
				},
			};
			wrapper.setProps(props);

			expect(wrapper).toMatchSnapshot();
		});

		test('render null with denied states', () => {
			const wrapper = shallow(<VerifyContact />);

			for (let i = 0; i < deniedStates.length; i += 1) {
				wrapper.setProps({
					authState: deniedStates[i],
					theme: 'theme',
				});

				expect(wrapper).toMatchSnapshot();
			}
		});

		test('hidden', () => {
			const wrapper = shallow(<VerifyContact />);
			const props = {
				authState: 'verifyContact',
				theme: 'theme',
				hide: [VerifyContact],
			};
			wrapper.setProps(props);

			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('interaction test', () => {
		test('Link clicked', () => {
			const spyon = jest
				.spyOn(VerifyContact.prototype, 'changeState')
				.mockImplementationOnce(() => {
					return;
				});
			const wrapper = shallow(<VerifyContact />);
			const props = {
				authState: 'verifyContact',
				theme: 'theme',
			};
			wrapper.setProps(props);

			wrapper.find(Link).simulate('click');

			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('verifyView ButonRow clicked', () => {
			const spyon = jest
				.spyOn(VerifyContact.prototype, 'verify')
				.mockImplementationOnce(() => {
					return;
				});
			const wrapper = shallow(<VerifyContact />);
			const props = {
				authState: 'verifyContact',
				theme: 'theme',
				authData: {
					unverified: {
						email: 'email@amazon.com',
						phone_number: '+12345678901',
					},
				},
			};
			wrapper.setProps(props);

			wrapper
				.find(Button)
				.at(0)
				.simulate('click');

			// expect(spyon).toBeCalled();

			spyon.mockClear();
		});
	});

	describe('verify test', () => {
		test('happy case', async () => {
			const spyon = jest
				.spyOn(Auth, 'verifyCurrentUserAttribute')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('data');
					});
				});
			const wrapper = shallow(<VerifyContact />);
			const verifyContact = wrapper.instance();
			verifyContact.inputs = {
				contact: true,
				checkedValue: 'email',
			};

			await verifyContact.verify();
			expect(spyon).toBeCalledWith('email');

			spyon.mockClear();
		});

		test('no cantact', async () => {
			const spyon = jest
				.spyOn(VerifyContact.prototype, 'error')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<VerifyContact />);
			const verifyContact = wrapper.instance();
			verifyContact.inputs = {
				contact: null,
			};

			await verifyContact.verify();
			expect(spyon).toBeCalledWith('Neither Email nor Phone Number selected');

			spyon.mockClear();
		});

		test('auth error', async () => {
			const spyon = jest
				.spyOn(Auth, 'verifyCurrentUserAttribute')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});
			const spyon2 = jest
				.spyOn(VerifyContact.prototype, 'error')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<VerifyContact />);
			const verifyContact = wrapper.instance();
			verifyContact.inputs = {
				contact: 'contact',
			};

			await verifyContact.verify();
			expect(wrapper.state('verifyAttr')).toBeNull();

			spyon.mockClear();
			spyon2.mockClear();
		});
	});

	describe('submit test', () => {
		test('happy case', async () => {
			const spyon = jest
				.spyOn(Auth, 'verifyCurrentUserAttributeSubmit')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('data');
					});
				});
			const spyon2 = jest
				.spyOn(VerifyContact.prototype, 'changeState')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<VerifyContact />);
			const verifyContact = wrapper.instance();
			wrapper.setState({ verifyAttr: 'attr' });
			verifyContact.inputs = {
				code: 'code',
			};

			await verifyContact.submit();
			expect(spyon).toBeCalledWith('attr', 'code');

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('auth error', async () => {
			const spyon = jest
				.spyOn(Auth, 'verifyCurrentUserAttributeSubmit')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});
			const spyon2 = jest
				.spyOn(VerifyContact.prototype, 'error')
				.mockImplementationOnce(() => {
					return;
				});
			const spyon3 = jest
				.spyOn(VerifyContact.prototype, 'changeState')
				.mockImplementationOnce(() => {
					return;
				});

			const wrapper = shallow(<VerifyContact />);
			const verifyContact = wrapper.instance();
			verifyContact.inputs = {
				code: 'code',
			};

			await verifyContact.submit();
			expect(spyon3).not.toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
		});
	});
});
