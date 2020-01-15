import {
	applyPolyfills,
	defineCustomElements,
} from '@aws-amplify/ui-components/loader';
import Vue from 'vue';

// Tell Vue to ignore all components defined in the @aws-amplify/ui-components
// package. The regex assumes all components names are prefixed
// 'amplify-'
Vue.config.ignoredElements = [/amplify-\w*/];

// Bind the custom elements to the window object
applyPolyfills().then(() => {
	defineCustomElements(window);
});
