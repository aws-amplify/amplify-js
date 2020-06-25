import { Adapter } from '..';
import adapter from '../AsyncStorageAdapter';

const getDefaultAdapter: () => Adapter = () => {
	return adapter;
};

export default getDefaultAdapter;
