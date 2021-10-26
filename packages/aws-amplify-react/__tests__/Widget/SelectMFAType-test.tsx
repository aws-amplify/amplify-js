import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { SelectMFAType } from '../../src/Widget/SelectMFAType';
import { Button } from '../../src/Amplify-UI/Amplify-UI-Components-React';

describe('SelectMFAType test', () => {
	describe('render test', () => {
		test('render without totpsetup and with all mfa types and select message', () => {
			const MFATypes = {
				SMS: true,
				TOTP: true,
				Optional: true,
			};
			const wrapper = shallow(<SelectMFAType MFATypes={MFATypes} />);

			wrapper.setState({ TOTPSetup: false });
			wrapper.setState({ selectMessage: 'message' });

			expect(wrapper).toMatchSnapshot();
		});

		test('render without totpsetup and with less than 2 mfa types', () => {
			const MFATypes = {
				SMS: true,
			};
			const wrapper = shallow(<SelectMFAType MFATypes={MFATypes} />);

			wrapper.setState({ TOTPSetup: false });

			expect(wrapper).toMatchSnapshot();
		});

		test('render without totpsetup and with 2 mfa types', () => {
			const MFATypes = {
				SMS: true,
				TOTP: true,
			};
			const wrapper = shallow(<SelectMFAType MFATypes={MFATypes} />);

			wrapper.setState({ TOTPSetup: false });

			expect(wrapper).toMatchSnapshot();
		});

		test('render with totpsetup and with all mfa types and select message', () => {
			const MFATypes = {
				SMS: true,
				TOTP: true,
				Optional: true,
			};
			const wrapper = shallow(<SelectMFAType MFATypes={MFATypes} />);

			wrapper.setState({ TOTPSetup: true });
			wrapper.setState({ selectMessage: 'message' });

			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('interaction test', () => {
		test('verify button click test', () => {
			const spyon = jest
				.spyOn(SelectMFAType.prototype, 'verify')
				.mockImplementationOnce(() => {
					return;
				});
			const MFATypes = {
				SMS: true,
				TOTP: true,
				Optional: true,
			};
			const wrapper = shallow(<SelectMFAType MFATypes={MFATypes} />);

			wrapper.find(Button).simulate('click');

			expect(spyon).toBeCalled();
		});
	});

	describe('hanldeInputChange test', () => {
		test('happy case', () => {
			const wrapper = shallow(<SelectMFAType />);
			const instance = wrapper.instance();

			const evt = {
				target: {
					name: 'name',
					value: 'value',
					type: 'radio',
					checked: true,
				},
			};
			instance.handleInputChange(evt);
		});
	});

	describe('verify test', () => {
		test('happy case with SMS', async () => {
			const wrapper = shallow(<SelectMFAType />);
			const instance = wrapper.instance();

			const evt = {
				target: {
					name: 'MFAType',
					value: 'SMS',
					type: 'radio',
					checked: true,
				},
			};
			instance.handleInputChange(evt);

			const spyon = jest
				.spyOn(Auth, 'setPreferredMFA')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('data');
					});
				});

			await instance.verify();
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('happy case with SMS', async () => {
			const wrapper = shallow(<SelectMFAType />);
			const instance = wrapper.instance();

			const evt = {
				target: {
					name: 'MFAType',
					value: 'NOMFA',
					type: 'radio',
					checked: true,
				},
			};
			instance.handleInputChange(evt);

			const spyon = jest
				.spyOn(Auth, 'setPreferredMFA')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('data');
					});
				});

			await instance.verify();
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('happy case without inputs', async () => {
			const wrapper = shallow(<SelectMFAType />);
			const instance = wrapper.instance();

			const spyon = jest
				.spyOn(Auth, 'setPreferredMFA')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('data');
					});
				});

			await instance.verify();
			expect(spyon).not.toBeCalled();

			spyon.mockClear();
		});

		test('happy case with TOTP not setup yet', async () => {
			const wrapper = shallow(<SelectMFAType />);
			const instance = wrapper.instance();

			const evt = {
				target: {
					name: 'MFAType',
					value: 'TOTP',
					type: 'radio',
					checked: true,
				},
			};
			instance.handleInputChange(evt);

			const spyon = jest
				.spyOn(Auth, 'setPreferredMFA')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej({
							message: 'User has not set up software token mfa',
						});
					});
				});

			await instance.verify();
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('error case', async () => {
			const wrapper = shallow(<SelectMFAType />);
			const instance = wrapper.instance();

			const evt = {
				target: {
					name: 'MFAType',
					value: 'SMS',
					type: 'radio',
					checked: true,
				},
			};
			instance.handleInputChange(evt);

			const spyon = jest
				.spyOn(Auth, 'setPreferredMFA')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej('err');
					});
				});

			await instance.verify();
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});
	});
});
