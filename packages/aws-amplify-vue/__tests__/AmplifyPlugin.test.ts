import Vue from 'vue';
import App from '@/Amplify.vue';
import AmplifyPlugin from '@/plugins/AmplifyPlugin';

Vue.use(AmplifyPlugin, {});

describe('AmplifyPlugin edge case...', () => {
	let Component;
	let vm;

	beforeEach(() => {
		Component = Vue.extend(App);
		vm = new Component({}).$mount();
	});

	it('...the plugin install should fail if modules are not passed', () => {
		expect(vm.$Amplify).toBeFalsy();
	});
});
