import {
	applyPolyfills,
	defineCustomElements,
} from '@aws-amplify/ui-components/loader';
import Vue from 'vue';

// Tell Vue to ignore all components defined in the @aws-amplify/ui-components
// package. The regex assumes all components names are prefixed
// 'amplify-'
if (Vue) {
	Vue.config.ignoredElements = [/amplify-\w*/];
} else {
	throw new Error(
		'No Vue 2 export was found. For later versions of Vue, please use `@aws-amplify/ui-components` ' +
			'according to this guide: https://docs.amplify.aws/start/getting-started/setup/q/integration/vue.'
	);
}
// Bind the custom elements to the window object
applyPolyfills().then(() => {
	defineCustomElements(window);
});
