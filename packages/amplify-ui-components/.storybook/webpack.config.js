const path = require('path');
const webpack = require('webpack');

module.exports = ({ config, mode }) => {
	config = Object.assign(
		{
			module: {
				rules: [],
			},
			plugins: [],
		},
		config || {}
	);

	config.module.rules.push({
		test: /\.(ts|tsx)$/,
		include: path.resolve(__dirname, '../src'),
		loader: require.resolve('ts-loader'),
	});

	config.resolve.extensions.push('.ts', '.tsx');

	// Stencil requires a build step, stories using JSX will create DOM nodes instead.
	config.resolve.alias['@stencil/core$'] = require.resolve('./stencil-jsx');

	return config;
};
