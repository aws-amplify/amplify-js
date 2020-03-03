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
			brandTitle: 'Amplify UI',
			colorPrimary: '#232f3e',
			colorSecondary: '#ff9900',
			fontBase: '"Amazon Ember", "Helvetica", sans-serif',
			fontCode: '"Source Code Pro", Monaco, monospace',
		}),
	},
});
