import path from 'path';
import config from './rollup.config';

const newConfig = {
	...config,
	input: path.resolve(__dirname, '../build/es5/core.js'),
};
newConfig.output.file = path.resolve(__dirname, '../dist/fesm5.js');

export { newConfig as default };
