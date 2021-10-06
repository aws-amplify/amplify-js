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
			// set a longer TTL to avoid id being deleted after the default TTL (3 days)
			// also set its priority to the highest to reduce its chance of being deleted when cache is full
			// See also: https://github.com/aws-amplify/amplify-js/pull/8982
			const ttl = 1000 * 60 * 60 * 24 * 365 * 100; // 100 years
			const expiration = new Date().getTime() + ttl;
			await Cache.setItem(cacheKey, generatedUuid, {
				expires: expiration,
				priority: 1,
			});
			uuids[cacheKey] = generatedUuid;
			resolve(uuids[cacheKey]);
		} catch (err) {
			reject(err);
		} finally {
			delete promises[cacheKey];
		}
	});
