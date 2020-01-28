import Amplify from '@aws-amplify/core';
import { dataStore as DataStore, initSchema } from './datastore/datastore';
import { Predicates } from './predicates';
export * from './types';
export { DataStore, initSchema, Predicates };
var datastore = {
	configure: DataStore.configure,
	getModuleName: getModuleName,
};
function getModuleName() {
	return 'DataStore';
}
Amplify.register(datastore);
//# sourceMappingURL=index.js.map
