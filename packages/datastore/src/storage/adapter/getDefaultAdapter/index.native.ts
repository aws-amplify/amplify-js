import { Adapter } from '..';
import AsyncStorageAdapter from '../asyncstorage';

const getDefaultAdapter: () => Adapter = () => {
	return AsyncStorageAdapter;
};

export default getDefaultAdapter;
