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

const corePath = path.resolve(path.join(__dirname, '..', '..', '..', '..'));
const outputDir = path.resolve(
	path.join(corePath, 'lib', 'clients', 'polyfills', 'URL')
);

module.exports = {
	name: 'index',
	context: path.resolve(__dirname),
	entry: {
		index: path.join(__dirname, 'index.ts'),
	},
	output: {
		path: path.resolve(__dirname),
		// filename: '[name].js',
		// path: '/Users/zheallan/workspace/amplify-js/packages/core/polyfills',
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
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
				type: 'asset',
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
	},
	externals: rnUrlPolyfillDepsRegex,
	mode: 'production',
};
