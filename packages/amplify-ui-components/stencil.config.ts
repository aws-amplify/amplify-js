import { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';
import { reactOutputTarget } from '@stencil/react-output-target';
import externals from 'rollup-plugin-node-externals';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { sass } from '@stencil/sass';

export const config: Config = {
	extras: {
		initializeNextTick: false,
	},
	excludeSrc: ['**/*.e2e.*', '**/*.spec.*', '**/*.stories.*'],
	namespace: 'amplify-ui-components',
	plugins: [
		externals({
			// deps to include in externals (default: [])
			include: [
				'@aws-amplify/auth',
				'@aws-amplify/core',
				'@aws-amplify/storage',
				'@aws-amplify/xr',
				'@aws-amplify/interactions',
			],
		}),
		nodePolyfills(),
		sass({
			injectGlobalPaths: ['src/global/breakpoint.scss'],
		}),
	],
	nodeResolve: {
		browser: true,
	},
	commonjs: {
		namedExports: {
			'@aws-sdk/client-cognito-identity-browser': [
				'CognitoIdentityClient',
				'GetIdCommand',
			],
			'@aws-sdk/credential-provider-cognito-identity': [
				'fromCognitoIdentity',
				'fromCognitoIdentityPool',
			],
			'@aws-crypto/sha256-js': ['Sha256'],
			'@aws-crypto/sha256-browser': ['Sha256'],
			'@aws-sdk/config-resolver': [
				'resolveRegionConfig',
				'resolveEndpointsConfig',
			],
			'@aws-sdk/middleware-signing': [
				'resolveAwsAuthConfig',
				'getAwsAuthPlugin',
			],
			'@aws-sdk/middleware-retry': ['resolveRetryConfig', 'getRetryPlugin'],
			'@aws-sdk/middleware-user-agent': [
				'resolveUserAgentConfig',
				'getUserAgentPlugin',
			],
			'@aws-sdk/smithy-client': ['Client', 'Command', 'isa'],
			'@aws-sdk/protocol-http': ['HttpRequest'],
			'@aws-sdk/middleware-serde': ['getSerdePlugin'],
			'@aws-sdk/property-provider': ['ProviderError'],
			'@aws-sdk/fetch-http-handler': ['FetchHttpHandler'],
			'@aws-sdk/util-uri-escape': ['escapeUri'],
		},
	},
	outputTargets: [
		// See: https://github.com/ionic-team/stencil-ds-plugins#angular
		angularOutputTarget({
			componentCorePackage: '@aws-amplify/ui-components',
			directivesProxyFile: '../amplify-ui-angular/src/directives/proxies.ts',
		}),
		reactOutputTarget({
			componentCorePackage: '@aws-amplify/ui-components',
			proxiesFile: '../amplify-ui-react/src/components.ts',
		}),
		{ type: 'dist' },
		{ type: 'dist-custom-elements-bundle', dir: 'dist/components' },
		{ type: 'docs-readme' },
		{ type: 'docs-json', file: 'dist/docs.json' },
		{
			type: 'www',
			serviceWorker: null, // disable service workers
		},
	],
	globalScript: 'src/global/theme.ts',
};
