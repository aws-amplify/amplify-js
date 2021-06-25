import { Adapter } from '..';
// import AsyncStorageAdapter from '../AsyncStorageAdapter';
import SQLiteAdapter from '../SQLiteAdapter';

const getDefaultAdapter: () => Adapter = () => {
	// return AsyncStorageAdapter;
	return SQLiteAdapter;
};

export default getDefaultAdapter;
