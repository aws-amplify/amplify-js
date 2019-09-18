import Vue from 'vue';
import App from '../src/Amplify.vue';
import AmplifyEventBus from '../src/events/AmplifyEventBus';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('Amplify (root vue)', () => {
	let Component;
	let vm;

	beforeEach(() => {
		Component = Vue.extend(App);
		vm = new Component({}).$mount();
	});

	it('...should be named "amplify"', () => {
		expect(vm.$options.name).toEqual('amplify');
	});

	it('...should import the AmplifyEventBus', () => {
		expect(vm.$options.AmplifyEventBus).toEqual(AmplifyEventBus);
	});

	it('...should use the amplify plugin with passed modules', () => {
		expect(vm.$Amplify).toBeTruthy();
	});
});
