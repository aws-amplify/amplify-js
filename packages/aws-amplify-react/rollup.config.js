import pkg from './package.json';
import tscES5 from './tsconfig.es5.json';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import json from 'rollup-plugin-json';

const external = [
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
    'qrcode.react'
];
export default {
    input: tscES5.compilerOptions.outDir + '/index.js',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            name: 'index',
            sourcemap: true,
            exports: 'named'
        }
    ],
    plugins: [
        json(),
        resolve(),
        sourceMaps(),
    ],
    external
}