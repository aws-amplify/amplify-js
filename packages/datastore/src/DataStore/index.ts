import { DataStore } from './DataStore';
import { initSchema } from './schema';

const instance = new DataStore();

export { DataStore as DataStoreClass, initSchema, instance as DataStore };
