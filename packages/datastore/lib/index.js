'use strict';
function __export(m) {
	for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, '__esModule', { value: true });
var core_1 = require('@aws-amplify/core');
var datastore_1 = require('./datastore/datastore');
exports.DataStore = datastore_1.dataStore;
exports.initSchema = datastore_1.initSchema;
var predicates_1 = require('./predicates');
exports.Predicates = predicates_1.Predicates;
__export(require('./types'));
var datastore = {
	configure: datastore_1.dataStore.configure,
	getModuleName: getModuleName,
};
function getModuleName() {
	return 'DataStore';
}
core_1.default.register(datastore);
//# sourceMappingURL=index.js.map
