import pkg from './package.json';
import tscES5 from './tsconfig.es5.json';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';

const external = [
    '@aws-amplify/core',
    'aws-sdk/clients/s3'
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
        resolve(),
        sourceMaps(),
    ],
    external
}
