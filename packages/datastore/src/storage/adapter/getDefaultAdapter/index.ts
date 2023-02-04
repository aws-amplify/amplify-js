import { browserOrNode, isWebWorker } from '@aws-amplify/core';
import { Adapter } from '..';
import IndexedDBAdapter from '../IndexedDBAdapter';
// import AsyncStorageAdapter from '../AsyncStorageAdapter';

const getDefaultAdapter: () => Adapter = () => {
	return IndexedDBAdapter as Adapter;
};

export default getDefaultAdapter;
