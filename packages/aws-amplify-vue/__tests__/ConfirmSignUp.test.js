/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import ConfirmSignUp from '../src/components/authenticator/ConfirmSignUp.vue';
import AmplifyEventBus from '../src/events/AmplifyEventBus';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('ConfirmSignUp', () => {
	it('has a mounted hook', () => {
		expect(typeof ConfirmSignUp.mounted).toBe('function');
	});

	it('sets the correct default data', () => {
		expect(typeof ConfirmSignUp.data).toBe('function');
		const defaultData = ConfirmSignUp.data();
		expect(defaultData.code).toBe('');
		expect(defaultData.logger).toEqual({});
		expect(defaultData.error).toEqual('');
	});

	let wrapper;
	let header;
	let username;
	let testState;
	const mockConfirm = jest.fn();
	const mockResend = jest.fn();
	const mockSignIn = jest.fn();
	const mockSetError = jest.fn();

	describe('...when it is mounted without props...', () => {
		beforeEach(() => {
			wrapper = shallowMount(ConfirmSignUp);
			testState = null;
		});

		it('...it should use the amplify plugin with passed modules', () => {
			expect(wrapper.vm.$Amplify).toBeTruthy();
		});

		it('...it should be named ConfirmSignUp', () => {
			expect(wrapper.vm.$options.name).toEqual('ConfirmSignUp');
		});

		it('...it should instantiate a logger with the name of the component', () => {
			expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
		});

		it('...it should have a confirm method', () => {
			expect(wrapper.vm.confirm).toBeTruthy();
		});

		it('...should have a resend method', () => {
			expect(wrapper.vm.resend).toBeTruthy();
		});

		it('...should have a signIn method', () => {
			expect(wrapper.vm.signIn).toBeTruthy();
		});

		it('...it should have a setError method', () => {
			expect(wrapper.vm.setError).toBeTruthy();
		});

		it('...have default options', () => {
			expect(wrapper.vm.options.header).toEqual('i18n Confirm Sign Up');
			expect(wrapper.vm.options.username).toEqual('');
		});

		it('...should set the error property when a valid username is not received', () => {
			expect(wrapper.vm.error).toEqual('i18n Valid username not received.');
		});

		it('...should call Auth.confirmSignUp when confirm method is called', () => {
			wrapper.vm.confirm();
			expect(wrapper.vm.$Amplify.Auth.confirmSignUp).toBeCalled();
		});

		it('...should call Auth.resendSignUp when confirm method is called', () => {
			wrapper.vm.resend();
			expect(wrapper.vm.$Amplify.Auth.resendSignUp).toBeCalledWith(
				wrapper.vm.options.username
			);
		});

		it('...should emit authState when signIn method called', () => {
			testState = 0;
			AmplifyEventBus.$on('authState', (val) => {
				if (val === 'signIn') {
					testState = 1;
				}
			});
			wrapper.vm.signIn();
			expect(testState).toEqual(1);
		});
	});

	describe('...when it is mounted with props...', () => {
		beforeEach(() => {
			header = 'TestHeader';
			username = 'TestUsername';
			wrapper = shallowMount(ConfirmSignUp, {
				methods: {
					confirm: mockConfirm,
					resend: mockResend,
					signIn: mockSignIn,
					setError: mockSetError,
				},
				propsData: {
					confirmSignUpConfig: {
						username,
						header,
					},
				},
			});
		});

		afterEach(() => {
			mockConfirm.mockReset();
			mockResend.mockReset();
			mockSignIn.mockReset();
			mockSetError.mockReset();
		});
		it('...should not set the error property', () => {
			expect(wrapper.vm.error).toEqual('');
			expect(mockSetError).not.toHaveBeenCalled();
		});

		it('...should render the header from props', () => {
			const el = wrapper.find(`.${AmplifyUI.sectionHeader}`).element;
			expect(el.textContent).toEqual(header);
		});

		it('...should call confirm when confirm button is clicked', () => {
			const el = wrapper.find('button');
			el.trigger('click');
			expect(mockConfirm).toHaveBeenCalled();
		});

		it('...should call resend when resend is clicked', () => {
			const el = wrapper.find(`.${AmplifyUI.hint} > .${AmplifyUI.a}`);
			el.trigger('click');
			expect(mockResend).toHaveBeenCalled();
		});

		it('...should call signIn when signIn button is clicked', () => {
			const el = wrapper.find(`span > .${AmplifyUI.a}`);
			el.trigger('click');
			expect(mockSignIn).toHaveBeenCalled();
		});
	});
});
