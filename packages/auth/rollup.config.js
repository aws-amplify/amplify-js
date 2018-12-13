import pkg from './package.json';
import tscES5 from './tsconfig.es5.json';
import tscES2015 from './tsconfig.es2015.json';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import copy from 'rollup-plugin-copy-glob';
import json from 'rollup-plugin-json';

const external = [
    '@aws-amplify/cache',
    '@aws-amplify/core',
    'amazon-cognito-auth-js',
    'amazon-cognito-identity-js',
];
export default [
    {
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
    },
    {
        input: tscES2015.compilerOptions.outDir + '/index.js',
        output: [
            {
                file: pkg.module,
                format: 'esm',
                name: 'index',
                sourcemap: true,
                exports: 'named'
            }
        ],
        plugins: [
            json(),
            resolve(),
            sourceMaps(),
            copy([{files: 'tsc-out/esm/**/*.d.ts', dest: 'dist'}])
        ],
        external
    }
]