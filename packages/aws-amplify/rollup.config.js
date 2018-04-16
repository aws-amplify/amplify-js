import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/rollup/bundle.js',
        format: 'umd'
    },
    plugins: [
        typescript(),
        commonjs()
    ]
}