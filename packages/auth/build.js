'use strict';

const build = require('../../scripts/build');
const tsconfig = require('./tsconfig.json');
<<<<<<< HEAD
=======

>>>>>>> df5ad308b (refactor: add tsconfig file as a third parameter to build.js)
build(process.argv[2], process.argv[3], tsconfig);
