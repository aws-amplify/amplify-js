/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import PhoneField from '../src/components/authenticator/PhoneField.vue';
import UsernameField from '../src/components/authenticator/UsernameField.vue';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('UsernameField', () => {
	it('sets the correct default data', () => {
		expect(typeof UsernameField.data).toBe('function');
		const defaultData = UsernameField.data();
		expect(defaultData.username).toEqual('');
		expect(defaultData.email).toEqual('');
		expect(defaultData.phoneNumberRequired).toEqual(true);
	});

	let wrapper = null;
	const mockEmailChanged = jest.fn();
	const mockUsernameChanged = jest.fn();
	const mockPhoneNumberChanged = jest.fn();

	describe('when usernameAttributes is email', () => {
		beforeEach(() => {
			wrapper = shallowMount(UsernameField, {
				methods: {
					phoneNumberChanged: mockPhoneNumberChanged,
					usernameChanged: mockUsernameChanged,
					emailChanged: mockEmailChanged,
				},
				propsData: {
					usernameAttributes: 'email',
				},
			});
		});

		afterEach(() => {
			mockPhoneNumberChanged.mockReset();
			mockEmailChanged.mockReset();
			mockUsernameChanged.mockReset();
		});

		it('only render email input', () => {
			expect(wrapper.findAll('input').length).toBe(1);
			expect(wrapper.findAll(PhoneField).length).toBe(0);
		});

		it('trigger emailChanged when input is filled', () => {
			wrapper.findAll('input').at(0).trigger('keyup');
			expect(mockEmailChanged).toBeCalled();
		});
	});

	describe('when usernameAttributes is not defined', () => {
		beforeEach(() => {
			wrapper = shallowMount(UsernameField, {
				methods: {
					phoneNumberChanged: mockPhoneNumberChanged,
					usernameChanged: mockUsernameChanged,
					emailChanged: mockEmailChanged,
				},
				propsData: {
					usernameAttributes: undefined,
				},
			});
		});

		afterEach(() => {
			mockPhoneNumberChanged.mockReset();
			mockEmailChanged.mockReset();
			mockUsernameChanged.mockReset();
		});

		it('only render email input', () => {
			expect(wrapper.findAll('input').length).toBe(1);
			expect(wrapper.findAll(PhoneField).length).toBe(0);
		});

		it('trigger emailChanged when input is filled', () => {
			wrapper.findAll('input').at(0).trigger('keyup');
			expect(mockUsernameChanged).toBeCalled();
		});
	});

	describe('when usernameAttributes is phone_number', () => {
		beforeEach(() => {
			wrapper = shallowMount(UsernameField, {
				methods: {
					phoneNumberChanged: mockPhoneNumberChanged,
					usernameChanged: mockUsernameChanged,
					emailChanged: mockEmailChanged,
				},
				propsData: {
					usernameAttributes: 'phone_number',
				},
			});
		});

		afterEach(() => {
			mockPhoneNumberChanged.mockReset();
			mockEmailChanged.mockReset();
			mockUsernameChanged.mockReset();
		});

		it('only render email input', () => {
			expect(wrapper.findAll(PhoneField).length).toBe(1);
		});

		it('trigger emailChanged when input is filled', () => {
			wrapper.findAll(PhoneField).at(0).vm.$emit('phone-number-changed');
			expect(mockPhoneNumberChanged).toBeCalled();
		});
	});
});
