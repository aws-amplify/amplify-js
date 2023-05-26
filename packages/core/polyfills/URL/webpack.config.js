const path = require('path');

const rnUrlPolyfillPath = require.resolve('react-native-url-polyfill');
const rnUrlPolyfillMeta = require(path.join(
	path.dirname(rnUrlPolyfillPath),
	'package.json'
));
const rnUrlPolyfillDeps = Object.keys({
	...rnUrlPolyfillMeta.dependencies,
	...rnUrlPolyfillMeta.peerDependencies,
});
const rnUrlPolyfillDepsRegex = rnUrlPolyfillDeps.map(
	name => new RegExp(`^${name}\/?`) // match name with optional trailing slash
);

module.exports = {
	name: 'index',
	context: path.resolve(__dirname),
	entry: {
		index: path.join(__dirname, 'index.ts'),
	},
	output: {
		path: path.resolve(__dirname),
		filename: '[name].js',
		library: {
			type: 'commonjs',
		},
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/i,
				loader: 'ts-loader',
				exclude: ['/node_modules/'],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js'],
	},
	externals: rnUrlPolyfillDepsRegex,
	mode: 'production',
};
