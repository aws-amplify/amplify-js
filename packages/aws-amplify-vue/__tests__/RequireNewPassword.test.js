/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import RequireNewPassword from '../src/components/authenticator/RequireNewPassword.vue';
import AmplifyEventBus from '../src/events/AmplifyEventBus';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */
Vue.use(AmplifyPlugin, AmplifyMocks);
describe('RequireNewPassword', () => {
	it('has a mounted hook', () => {
		expect(typeof RequireNewPassword.mounted).toBe('function');
	});
	it('sets the correct default data', () => {
		expect(typeof RequireNewPassword.data).toBe('function');
		const defaultData = RequireNewPassword.data();
		expect(defaultData.logger).toEqual({});
		expect(defaultData.error).toEqual('');
	});
	let wrapper;
	let header;
	let testState;
	const mockSubmit = jest.fn();
	const mockVerify = jest.fn();
	const mockSignIn = jest.fn();
	const mockSetError = jest.fn();
	describe('...when it is mounted without props...', () => {
		beforeEach(() => {
			wrapper = shallowMount(RequireNewPassword);
			testState = null;
		});
		it('...it should use the amplify plugin with passed modules', () => {
			console.log('wrapper', wrapper);
			expect(wrapper.vm.$Amplify).toBeTruthy();
		});
		it('...it should be named RequireNewPassword', () => {
			expect(wrapper.vm.$options.name).toEqual('RequireNewPassword');
		});
		it('...it should instantiate a logger with the name of the component', () => {
			expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
		});
		it('...it should have a change method', () => {
			expect(wrapper.vm.change).toBeTruthy();
		});
		it('...should have a checkContact method', () => {
			expect(wrapper.vm.checkContact).toBeTruthy();
		});
		it('...should have a signIn method', () => {
			expect(wrapper.vm.signIn).toBeTruthy();
		});
		it('...it should have a setError method', () => {
			expect(wrapper.vm.setError).toBeTruthy();
		});
		it('...have default options', () => {
			expect(wrapper.vm.options.header).toEqual('i18n Enter new password');
		});
		it('...should call Auth.completeNewPassword when change method is called', () => {
			wrapper.vm.change();
			expect(wrapper.vm.$Amplify.Auth.completeNewPassword).toBeCalled();
		});
		it('...should set the local error variable when setError is called', () => {
			wrapper.vm.setError('I messed up');
			expect(wrapper.vm.error).toEqual('i18n I messed up');
		});
		it('...should call Auth.forgotPasswordSubmit when checkContact method is called', () => {
			wrapper.vm.checkContact();
			expect(wrapper.vm.$Amplify.Auth.verifiedContact).toBeCalled();
		});
	});
	describe('...when it is mounted with props...', () => {
		beforeEach(() => {
			header = 'TestHeader';
			wrapper = shallowMount(RequireNewPassword, {
				methods: {
					verify: mockVerify,
					submit: mockSubmit,
					signIn: mockSignIn,
					setError: mockSetError,
				},
				propsData: {
					requireNewPasswordConfig: {
						header,
						user: {
							challengeParam: {},
						},
					},
				},
			});
		});
		afterEach(() => {
			mockVerify.mockReset();
			mockSubmit.mockReset();
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
		it('...should call signIn when signIn button is clicked', () => {
			const el = wrapper.find(
				`.${AmplifyUI.sectionFooterSecondaryContent} > .${AmplifyUI.a}`
			);
			el.trigger('click');
			expect(mockSignIn).toHaveBeenCalled();
		});
	});
});
