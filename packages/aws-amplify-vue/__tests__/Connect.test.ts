import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import Connect from '@/components/api/graphql/Connect.vue';
import AmplifyPlugin from '@/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('Connect', () => {
	let connect;

	beforeEach(() => {
		connect = new Connect();
	});

	it('has a beforeMount hook', () => {
		expect(connect.$options.beforeMount.length).toEqual(2);
		expect(typeof connect.$options.beforeMount[0]).toBe('function');
		expect(typeof connect.$options.beforeMount[1]).toBe('function');
	});

	it('has a beforeDestroy hook', () => {
		expect(connect.$options.beforeDestroy.length).toEqual(1);
		expect(typeof connect.$options.beforeDestroy[0]).toBe('function');
	});

	it('sets the correct default data', () => {
		expect(typeof connect.$options.data).toBe('function');
		const defaultData = connect.$options.data();
		expect(defaultData.data).toEqual({});
		expect(defaultData.logger).toEqual(null);
		expect(defaultData.errors).toEqual([]);
		expect(defaultData.loading).toEqual(false);
		expect(defaultData.watchedSubscription).toEqual(null);
		expect(defaultData.isMutation).toEqual(false);
		expect(defaultData.internalMutation).toEqual(null);
	});
});
