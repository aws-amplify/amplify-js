const core_externals = ['aws-sdk', 'aws-sdk/global', 'react-native', 'url'];

const analytics_externals = [
	'@aws-amplify/cache',
	'@aws-amplify/core',
	'uuid',
	'aws-sdk/clients/pinpoint',
	'react-native',
	'aws-sdk/clients/kinesis',
];

const api_externals = [
	'axios',
	'graphql',
	'graphql/language/ast',
	'graphql/language/parser',
	'graphql/language/printer',
	'uuid',
	'zen-observable',
	'@aws-amplify/cache',
	'@aws-amplify/core',
];

const auth_externals = [
	'@aws-amplify/cache',
	'@aws-amplify/core',
	'amazon-cognito-auth-js',
	'amazon-cognito-identity-js',
];

const cache_externals = ['@aws-amplify/core'];

const storage_externals = ['@aws-amplify/core', 'aws-sdk/clients/s3'];

const interactions_externals = [
	'aws-sdk/clients/lexruntime',
	'@aws-amplify/core',
	'handlebars',
];

const xr_externals = ['@aws-amplify/core'];

const pubsub_externals = [
	'@aws-amplify/core',
	'@types/zen-observable',
	'uuid',
	'zen-observable',
	'paho-mqtt',
];

const amplify_externals = [
	'@aws-amplify/analytics',
	'@aws-amplify/api',
	'@aws-amplify/auth',
	'@aws-amplify/cache',
	'@aws-amplify/core',
	'@aws-amplify/interactions',
	'@aws-amplify/pubsub',
	'@aws-amplify/storage',
	'@aws-amplify/ui',
	'@aws-amplify/xr',
];

const aws_amplify_react = [
	'@aws-amplify/auth',
	'@aws-amplify/analytics',
	'@aws-amplify/api',
	'@aws-amplify/core',
	'@aws-amplify/interactions',
	'@aws-amplify/storage',
	'@aws-amplify/ui',
	'@aws-amplify/ui/dist/style.css',
	'@aws-amplify/xr',
	'react',
	'regenerator-runtime/runtime',
	'qrcode.react',
];

const rollup_externals = {
	'@aws-amplify/analytics': analytics_externals,
	'@aws-amplify/api': api_externals,
	'@aws-amplify/auth': auth_externals,
	'aws-amplify': amplify_externals,
	'aws-amplify-react': aws_amplify_react,
	'@aws-amplify/cache': cache_externals,
	'@aws-amplify/core': core_externals,
	'@aws-amplify/interactions': interactions_externals,
	'@aws-amplify/pubsub': pubsub_externals,
	'@aws-amplify/storage': storage_externals,
	'@aws-amplify/xr': xr_externals,
};

module.exports = rollup_externals;
