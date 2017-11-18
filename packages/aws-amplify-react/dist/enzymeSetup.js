'use strict';

var _enzyme = require('enzyme');

var _enzyme2 = _interopRequireDefault(_enzyme);

var _enzymeAdapterReact = require('enzyme-adapter-react-16');

var _enzymeAdapterReact2 = _interopRequireDefault(_enzymeAdapterReact);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// React 16 Enzyme adapter
_enzyme2['default'].configure({ adapter: new _enzymeAdapterReact2['default']() });

// Make Enzyme functions available in all test files without importing
global.shallow = _enzyme.shallow;
global.render = _enzyme.render;
global.mount = _enzyme.mount;

// Fail tests on any warning
console.error = function (message) {
   throw new Error(message);
};