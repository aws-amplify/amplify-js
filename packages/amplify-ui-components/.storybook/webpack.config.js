const path = require('path');
const webpack = require('webpack');

module.exports = ({ config, mode }) => {
  config = Object.assign(
    {
      module: {
        rules: []
      },
      plugins: []
    },
    config || {}
  );

  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    include: path.resolve(__dirname, '../src'),
    loader: require.resolve('ts-loader')
  });
  config.resolve.extensions.push('.ts', '.tsx');

  return config;
};
