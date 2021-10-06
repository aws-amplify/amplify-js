import Cache from '../AsyncStorageCache';
import { v1 as uuid } from 'uuid';

let uuids = {};
const promises = {};

export const getCachedUuid = (cacheKey: string): Promise<string> => {
	// if uuid for a key has been retrieved previously, just resolve
	if (uuids[cacheKey]) {
		return Promise.resolve(uuids[cacheKey]);
	}
	// if uuid for a key has not been retrieved, ensure only one retrieval process is running
	if (!promises[cacheKey]) {
		promises[cacheKey] = getUuid(cacheKey);
	}
	return promises[cacheKey];
};

export const removeUuid = (cacheKey: string) => {
	delete uuids[cacheKey];
};

export const clearUuids = () => {
	uuids = {};
};

const getUuid = (cacheKey: string): Promise<string> =>
	new Promise(async (resolve, reject) => {
		try {
			// retrieve uuid for a given key from storage
			const cachedUuid = await Cache.getItem(cacheKey);
			if (cachedUuid) {
				uuids[cacheKey] = cachedUuid;
				resolve(uuids[cacheKey]);
				return;
			}
			// if uuid for key was not found, generate and store it
			const generatedUuid = uuid();
			await Cache.setItem(cacheKey, generatedUuid);
			uuids[cacheKey] = generatedUuid;
			resolve(uuids[cacheKey]);
		} catch (err) {
			reject(err);
		} finally {
			delete promises[cacheKey];
		}
	});
