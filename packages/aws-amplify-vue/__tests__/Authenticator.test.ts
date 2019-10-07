import Vue from 'vue';
import { mocked } from 'ts-jest/utils';
import { shallowMount } from '@vue/test-utils';
import Authenticator from '@/components/authenticator/Authenticator.vue';
import AmplifyEventBus from '@/events/AmplifyEventBus';
import * as components from '@/components';
import AmplifyPlugin from '@/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
import dependency from '@/services/getUser';

Vue.use(AmplifyPlugin, AmplifyMocks);
jest.mock('@/services/getUser');

describe('Authenticator', () => {
	let authenticator;

	beforeEach(() => {
		authenticator = new Authenticator();
	});

	it('has a mounted hook', () => {
		expect(authenticator.$options.mounted.length).toEqual(1);
		expect(typeof authenticator.$options.mounted[0]).toBe('function');
	});

	it('sets the correct default data', () => {
		expect(typeof authenticator.$options.data).toEqual('function');
		const defaultData = authenticator.$options.data();
		expect(defaultData.user).toBe(null);
		expect(defaultData.logger).toEqual(null);
		expect(defaultData.displayMap).toEqual({});
		expect(defaultData.error).toEqual('');
	});

	describe('...when it is mounted...', () => {
		let wrapper;

		beforeEach(() => {
			wrapper = shallowMount(Authenticator);
			mocked(dependency).mockImplementation(() => Promise.resolve(null));
		});

		it('...it should use the amplify plugin with passed modules', () => {
			expect(wrapper.vm.$Amplify).toBeTruthy();
		});

		it('...it should be named Authenticator', () => {
			expect(wrapper.vm.$options.name).toEqual('Authenticator');
		});

		it('...it should instantiate a logger with the name of the component', () => {
			expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
		});

		it('...it should have an updateDisplayMap method', () => {
			expect(wrapper.vm.updateDisplayMap).toBeTruthy();
		});

		it('...it should have a setError method', () => {
			expect(wrapper.vm.setError).toBeTruthy();
		});

		it('...it should call GetUser', () => {
			expect(dependency).toBeCalledWith(AmplifyMocks);
		});
	});

	describe('...when it is mounted and displaying components...', () => {
		let wrapper;
		let mockDisplayMap = {} as any;
		beforeEach(() => {
			wrapper = shallowMount(Authenticator, {
				// methods: {
				//   updateDisplayMap: mockUpdateDisplayMap,
				// }
			});
			wrapper.vm.updateDisplayMap = jest.fn(() => mockDisplayMap);
			mocked(dependency).mockImplementation(() => Promise.reject(new Error()));
			mockDisplayMap = {
				showSignIn: false,
				showSignUp: false,
				showConfirmSignUp: false,
				showConfirmSignIn: false,
				showForgotPassword: false,
			};
		});

		afterEach(() => {
			wrapper.vm.displayMap = {};
		});

		it('...it should call updateDisplayMap', () => {
			expect(wrapper.vm.updateDisplayMap).toBeCalled();
		});

		it('...it should display the signIn component based on displayMap', () => {
			mockDisplayMap.showSignIn = true;
			wrapper.vm.displayMap = mockDisplayMap;
			const el = wrapper.find(components.SignIn).element;
			expect(el).toBeTruthy();
		});

		it('...it should display the signUp component based on displayMap', () => {
			mockDisplayMap.showSignUp = true;
			wrapper.vm.displayMap = mockDisplayMap;
			const el = wrapper.find(components.SignUp).element;
			expect(el).toBeTruthy();
		});

		it('...it should display the confirmSignUp component based on displayMap', () => {
			mockDisplayMap.showConfirmSignUp = true;
			wrapper.vm.displayMap = mockDisplayMap;
			const el = wrapper.find(components.ConfirmSignUp).element;
			expect(el).toBeTruthy();
		});

		it('...it should display the ConfirmSignIn component based on displayMap', () => {
			mockDisplayMap.showConfirmSignIn = true;
			wrapper.vm.displayMap = mockDisplayMap;
			const el = wrapper.find(components.ConfirmSignIn).element;
			expect(el).toBeTruthy();
		});

		it('...it should display the ForgotPassword component based on displayMap', () => {
			mockDisplayMap.showForgotPassword = true;
			wrapper.vm.displayMap = mockDisplayMap;
			const el = wrapper.find(components.ForgotPassword).element;
			expect(el).toBeTruthy();
		});

		it('...should set user and options data on localUser event emission', () => {
			const testUser = { getUsername: () => 'IAMEMITTED' };
			AmplifyEventBus.$emit('localUser', testUser);
			expect(wrapper.vm.user.getUsername()).toEqual(testUser.getUsername());
		});
	});
});
