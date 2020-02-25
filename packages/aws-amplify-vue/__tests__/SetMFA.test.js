import Vue from 'vue';
import { shallowMount } from '@vue/test-utils'; // eslint-disable-line
import QrcodeVue from 'qrcode.vue'; // eslint-disable-line
import * as AmplifyUI from '@aws-amplify/ui'; // eslint-disable-line
import SetMFA from '../src/components/authenticator/SetMFA.vue';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('SetMFA', () => {
	it('has a mounted hook', () => {
		expect(typeof SetMFA.mounted).toBe('function');
	});

	it('sets the correct default data', () => {
		expect(typeof SetMFA.data).toBe('function');
		const defaultData = SetMFA.data();
		expect(defaultData.user).toBe(null);
		expect(defaultData.mfaPreference).toBe(null);
		expect(defaultData.token).toBe('');
		expect(defaultData.displayTotpSetup).toBe(false);
		expect(defaultData.logger).toEqual({});
		expect(defaultData.error).toEqual('');
	});

	let wrapper;
	let testText;
	const mockSetup = jest.fn();
	const mockSetUser = jest.fn();
	const mockSetMFA = jest.fn();
	const mockVerifyTotpToken = jest.fn();
	const mockSetError = jest.fn();

	describe('...when it is mounted without props...', () => {
		beforeEach(() => {
			wrapper = shallowMount(SetMFA);
		});

		it('...it should use the amplify plugin with passed modules', () => {
			expect(wrapper.vm.$Amplify).toBeTruthy();
		});

		it('...it should be named SetMFA', () => {
			expect(wrapper.vm.$options.name).toEqual('SetMfa');
		});

		it('...it should instantiate a logger with the name of the component', () => {
			expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
		});

		it('...it should have an setup method', () => {
			expect(wrapper.vm.setup).toBeTruthy();
		});

		it('...should have a setUser method', () => {
			expect(wrapper.vm.setUser).toBeTruthy();
		});

		it('...should have a setMFA method', () => {
			expect(wrapper.vm.setMFA).toBeTruthy();
		});

		it('...should have a verifyTotpToken method', () => {
			expect(wrapper.vm.verifyTotpToken).toBeTruthy();
		});

		it('...it should have a setError method', () => {
			expect(wrapper.vm.setError).toBeTruthy();
		});

		it('...have default options', () => {
			expect(wrapper.vm.options.header).toEqual(
				'Multifactor Authentication Preference'
			);
		});
		it('...should call Auth.setPreferredMFA when setMFA function is called', () => {
			wrapper.vm.setMFA();
			expect(wrapper.vm.$Amplify.Auth.setPreferredMFA).toHaveBeenCalledTimes(1);
		});
		it('...should call Auth.verifyTotpToken when verifyTotpToken function is called', () => {
			wrapper.vm.verifyTotpToken();
			expect(wrapper.vm.$Amplify.Auth.verifyTotpToken).toHaveBeenCalledTimes(1);
		});
	});

	describe('...whent it is mounted with props but methods unmocked', () => {
		beforeEach(() => {
			wrapper = shallowMount(SetMFA, {
				propsData: {
					mfaConfig: {
						header: testText,
						mfaDescription: testText,
						tokenInstructions: testText,
						smsDescription: testText,
						totpDescription: testText,
						noMfaDescription: testText,
						mfaTypes: [],
					},
				},
			});
		});
		it('...should call Auth.setupTOTP when setup function is called', async () => {
			wrapper.vm.setup();
			let testToken = `otpauth://totp/AWSCognito:${wrapper.vm.user.username}?secret=gibberish&issuer=AWSCognito`;
			await expect(wrapper.vm.$Amplify.Auth.setupTOTP).toBeCalledWith(
				wrapper.vm.user
			);
			expect(wrapper.vm.token).toEqual(testToken);
		});
	});

	describe('...when it is mounted with props...', () => {
		beforeEach(() => {
			testText = 'TestText';
			wrapper = shallowMount(SetMFA, {
				methods: {
					setup: mockSetup,
					setUser: mockSetUser,
					setMFA: mockSetMFA,
					verifyTotpToken: mockVerifyTotpToken,
					setError: mockSetError,
				},
				propsData: {
					mfaConfig: {
						header: testText,
						mfaDescription: testText,
						tokenInstructions: testText,
						smsDescription: testText,
						totpDescription: testText,
						noMfaDescription: testText,
						mfaTypes: [],
					},
				},
			});
		});

		afterEach(() => {
			mockSetup.mockReset();
			mockSetUser.mockReset();
			mockSetMFA.mockReset();
			mockVerifyTotpToken.mockReset();
			mockSetError.mockReset();
		});
		it('...should not set the error property', () => {
			expect(wrapper.vm.error).toEqual('');
			expect(mockSetError).not.toHaveBeenCalled();
		});

		it('...should render the header from props', () => {
			const el = wrapper.find(`.${AmplifyUI.sectionHeader}`).element;
			expect(el.firstChild.textContent.trim()).toEqual(testText);
		});

		it('...should render the mfaDescription from props', () => {
			const el = wrapper.find(`.${AmplifyUI.sectionHeader} > div`).element;
			expect(el.textContent.trim()).toEqual(testText);
		});

		it('...should not render the sms radio button if sms is not in mfaTypes', () => {
			const el = wrapper.find(`.${AmplifyUI.sectionHeader} > div`).element;
			expect(el.textContent.trim()).toEqual(testText);
		});

		it('...should call setUser on mount', () => {
			expect(mockSetUser).toHaveBeenCalled();
		});

		it('...should display setMFA button if !displayTotpSetup', () => {
			const el = wrapper.find('#setMfa').exists;
			expect(el).toBeTruthy();
		});

		it('...should not display setMFA button if displayTotpSetup', () => {
			wrapper.vm.token = 'token';
			wrapper.vm.displayTotpSetup = true;
			const el = wrapper.find('#setMFA').element;
			expect(el).toBeFalsy();
		});

		it('...should call setMFA on setMFA button click', () => {
			const el = wrapper.find(
				`.${AmplifyUI.sectionFooterPrimaryContent} > button`
			);
			el.trigger('click');
			expect(mockSetMFA).toHaveBeenCalled();
		});

		it('...should display verifyTotpToken button if displayTotpSetup', () => {
			wrapper.vm.token = 'token';
			wrapper.vm.displayTotpSetup = true;
			const el = wrapper.find('#verify').exists;
			expect(el).toBeTruthy();
		});

		it('...should not display verifyTotpToken button if !displayTotpSetup', () => {
			const el = wrapper.find('#verify').element;
			expect(el).toBeFalsy();
		});

		it('...should call verifyTotpToken on verifyTotpToken button click', () => {
			wrapper.vm.token = 'token';
			wrapper.vm.displayTotpSetup = true;
			const el = wrapper.find('#verify');
			el.trigger('click');
			expect(mockVerifyTotpToken).toHaveBeenCalled();
		});

		it('...setup should be called when mfaPreference changes', () => {
			wrapper.vm.mfaPreference = 'TOTP';
			expect(mockSetup).toHaveBeenCalled();
		});

		it('...Qrcode element should not exist if displayTotpSetup is false', () => {
			const qr = wrapper.find(`.${AmplifyUI.totpQrcode}`).exists();
			expect(qr).toBeFalsy();
		});

		it('...vQrcode element should exist if displayTotpSetup is true', () => {
			wrapper.vm.token = 'testtoken';
			wrapper.vm.displayTotpSetup = true;
			const qr = wrapper.find(`.${AmplifyUI.totpQrcode}`).exists();
			expect(qr).toBeTruthy();
		});
	});
});
