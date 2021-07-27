import Cache from '../AsyncStorageCache';
import { v1 as uuid } from 'uuid';

const uuids = {};
const promises = {};

export const getCachedUuid = (cacheKey: string): Promise<string> => {
	// if uuid for a key has been created, just resolve
	if (uuids[cacheKey]) {
		return Promise.resolve(uuids[cacheKey]);
	}
	// if uuid for a key has not been created, ensure only one creation process is running
	if (!promises[cacheKey]) {
		promises[cacheKey] = getUuid(cacheKey);
	}
	return promises[cacheKey];
};

const getUuid = (cacheKey: string): Promise<string> =>
	new Promise(async (resolve, reject) => {
		try {
			const cachedUuid = await Cache.getItem(cacheKey);
			if (cachedUuid) {
				uuids[cacheKey] = cachedUuid;
				resolve(uuids[cacheKey]);
				return;
			}
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
