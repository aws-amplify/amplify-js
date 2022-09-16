'use strict';

const build = require('../../scripts/build');
const tsconfig = require('./tsconfig.json');
build(process.argv[2], process.argv[3]);
