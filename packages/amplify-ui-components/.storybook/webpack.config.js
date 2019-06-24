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

  return config;
};
