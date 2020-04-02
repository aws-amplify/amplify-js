import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { TOTPSetupComp } from '../../src/Widget/TOTPSetupComp';
import { Button } from '../../src/Amplify-UI/Amplify-UI-Components-React';

describe('TOTPSetupComp test', () => {
	describe('render test', () => {
		test('render without code or setupMessage', () => {
			const wrapper = shallow(<TOTPSetupComp />);

			expect(wrapper).toMatchSnapshot();
		});

		test('render with code and setupMessage', () => {
			const wrapper = shallow(<TOTPSetupComp />);
			wrapper.setState({ code: 'code' });
			wrapper.setState({ setupMessage: 'message' });

			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('interaction test', () => {
		test('verify button test', () => {
			const spyon = jest
				.spyOn(TOTPSetupComp.prototype, 'verifyTotpToken')
				.mockImplementationOnce(() => {
					return;
				});
			const wrapper = shallow(<TOTPSetupComp />);
			wrapper.setState({ code: 'code' });

			wrapper.find(Button).simulate('click');

			expect(spyon).toBeCalled();
		});

		test('get secret key button test', () => {
			const spyon = jest
				.spyOn(TOTPSetupComp.prototype, 'setup')
				.mockImplementationOnce(() => {
					return;
				});
			const wrapper = shallow(<TOTPSetupComp />);

			wrapper.find(Button).simulate('click');

			expect(spyon).toBeCalled();
		});
	});

	describe('hanldeInputChange test', () => {
		test('happy case', () => {
			const wrapper = shallow(<TOTPSetupComp />);
			const instance = wrapper.instance();

			const evt = {
				target: {
					name: 'name',
					value: 'value',
				},
			};
			instance.handleInputChange(evt);
		});
	});

	describe('setup test', () => {
		test('happy case', async () => {
			const wrapper = shallow(<TOTPSetupComp />);
			const instance = wrapper.instance();

			const spyon = jest.spyOn(Auth, 'setupTOTP').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res();
				});
			});

			await instance.setup();

			expect(spyon).toBeCalled();

			spyon.mockRestore();
		});

		test('error case', async () => {
			const wrapper = shallow(<TOTPSetupComp />);
			const instance = wrapper.instance();

			const spyon = jest.spyOn(Auth, 'setupTOTP').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej();
				});
			});

			await instance.setup();

			expect(spyon).toBeCalled();

			spyon.mockRestore();
		});
	});

	describe('triggerTOTPEvent test', () => {
		test('happy case', () => {
			const mockFn = jest.fn();
			const wrapper = shallow(<TOTPSetupComp onTOTPEvent={mockFn} />);
			const instance = wrapper.instance();

			instance.triggerTOTPEvent('event', 'data', 'user');

			expect(mockFn).toBeCalledWith('event', 'data', 'user');
		});
	});

	describe('verifyTotpToken test', () => {
		test('happy case', async () => {
			const wrapper = shallow(<TOTPSetupComp />);
			const instance = wrapper.instance();

			const evt = {
				target: {
					name: 'name',
					value: 'value',
				},
			};
			instance.handleInputChange(evt);

			const spyon = jest
				.spyOn(Auth, 'verifyTotpToken')
				.mockImplementation(() => {
					return new Promise((res, rej) => {
						res();
					});
				});

			const spyon2 = jest
				.spyOn(Auth, 'setPreferredMFA')
				.mockImplementation(() => {
					return new Promise((res, rej) => {
						res();
					});
				});

			const spyon3 = jest.spyOn(instance, 'triggerTOTPEvent');
			await instance.verifyTotpToken();

			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalled();
			expect(spyon3).toBeCalled();

			spyon.mockRestore();
			spyon2.mockRestore();
			spyon3.mockRestore();
		});

		test('no input', async () => {
			const wrapper = shallow(<TOTPSetupComp />);
			const instance = wrapper.instance();

			const spyon = jest
				.spyOn(Auth, 'verifyTotpToken')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res();
					});
				});

			await instance.verifyTotpToken();

			expect(spyon).not.toBeCalled();

			spyon.mockRestore();
		});

		test('error case', async () => {
			const wrapper = shallow(<TOTPSetupComp />);
			const instance = wrapper.instance();

			const evt = {
				target: {
					name: 'name',
					value: 'value',
				},
			};
			instance.handleInputChange(evt);

			const spyon = jest
				.spyOn(Auth, 'verifyTotpToken')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						rej();
					});
				});

			const spyon2 = jest
				.spyOn(Auth, 'setPreferredMFA')
				.mockImplementation(() => {
					return new Promise((res, rej) => {
						res();
					});
				});

			await instance.verifyTotpToken();

			expect(spyon).toBeCalled();
			expect(spyon2).not.toBeCalled();

			spyon.mockRestore();
		});
	});
});
