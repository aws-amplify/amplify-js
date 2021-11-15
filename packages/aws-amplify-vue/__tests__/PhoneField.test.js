/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import PhoneField from '../src/components/authenticator/PhoneField.vue';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
import countries from '../src/assets/countries';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('PhoneField', () => {
	let wrapper = null;
	const mockPhoneNumberChanged = jest.fn();
	beforeEach(() => {
		wrapper = shallowMount(PhoneField, {
			methods: {
				emitPhoneNumberChanged: mockPhoneNumberChanged,
			},
		});
	});

	afterEach(() => {
		mockPhoneNumberChanged.mockReset();
	});

	it('sets the correct default data', () => {
		expect(typeof PhoneField.data).toBe('function');
		const defaultData = PhoneField.data();
		expect(defaultData.countryCode).toEqual('1');
		expect(defaultData.local_phone_number).toEqual('');
		expect(defaultData.countries).toEqual(countries);
	});

	it('emit phone number changed when country code changed', () => {
		wrapper.findAll('select').at(0).trigger('change');
		expect(mockPhoneNumberChanged).toBeCalled();
	});

	it('emit phone number changed when local phone numer changed', () => {
		wrapper.findAll('input').at(0).trigger('keyup');
		expect(mockPhoneNumberChanged).toBeCalled();
	});
});
