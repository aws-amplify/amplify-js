// // https://reactjs.org/blog/2018/10/01/create-react-app-v2.html#breaking-changes
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import { addDecorator, addParameters } from '@storybook/react';
import { create } from '@storybook/theming';
import { extractPropsFromComponentName } from './extractPropsFromComponentName';
import { withAmplify } from './withAmplify';

addDecorator(withAmplify);

addParameters({
	docs: {
		extractProps: extractPropsFromComponentName,
	},

	options: {
		theme: create({
			appBg: '#F6F6F5',
			base: 'light',
			brandImage:
				'https://aws-amplify.github.io/docs/images/Logos/Amplify%20Logo.svg',
			brandTitle: 'Amplify UI Components',
			colorPrimary: '#232f3e',
			colorSecondary: '#ff9900',
			fontBase: '"Amazon Ember", "Helvetica", sans-serif',
			fontCode: '"Source Code Pro", Monaco, monospace',
		}),
	},
});
