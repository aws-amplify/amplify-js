import { Adapter } from '..';
// import AsyncStorageAdapter from '../AsyncStorageAdapter';
import SQLiteAdapter from '../SQLiteAdapter';

const getDefaultAdapter: () => Adapter = () => {
	return SQLiteAdapter;
};

export default getDefaultAdapter;
