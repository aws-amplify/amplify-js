const core_externals = [
    'aws-sdk',
    'aws-sdk/global',
    'react-native'
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
    '@aws-amplify/core'
];

const auth_externals = [
    '@aws-amplify/cache',
    '@aws-amplify/core',
    'amazon-cognito-auth-js',
    'amazon-cognito-identity-js',
];

const cache_externals = [
    '@aws-amplify/core',
];

const storage_externals = [
    '@aws-amplify/core',
    'aws-sdk/clients/s3'
];

const xr_externals = [
    '@aws-amplify/core',
];

const rollup_externals = {
    "@aws-amplify/api": api_externals,
    "@aws-amplify/auth": auth_externals,
    "@aws-amplify/cache": cache_externals,
    "@aws-amplify/core": core_externals,
    "@aws-amplify/storage": storage_externals,
    "@aws-amplify/xr": xr_externals
};

module.exports = rollup_externals;
