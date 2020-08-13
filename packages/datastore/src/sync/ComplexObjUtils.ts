import { DataStore } from '../index';
import * as idb from 'idb';

let db: idb.IDBPDatabase;

function tryParseJSON(jsonString) {
	try {
		var o = JSON.parse(jsonString);
		if (o && typeof o === 'object') {
			return o;
		}
	} catch (e) {}

	return false;
}

function handleComplexObjects(cloudObject, localObject) {
	console.log('Into the real');
	console.log(localObject);
	let result = {};
	let queue = {
		newObj: result,
		cloudValue: cloudObject,
		localValue: localObject,
		next: null,
	};
	let end = queue;
	let newObj;
	for (; queue; queue = queue.next) {
		const item = queue;
		const cloud = item.cloudValue;
		const local = item.localValue;
		newObj = item.newObj;
		const keys = Object.keys(cloud);
		for (const key of keys) {
			const cloudValue = cloud[key];
			const localValue = local[key];
			const isJsonString = tryParseJSON(cloudValue);
			if (isJsonString && isJsonString.S3link && localValue instanceof File) {
				console.log('found file');
				newObj[key] = localValue;
			} else if (typeof cloudValue === 'object') {
				const resultValue = (newObj[key] = {});
				end.next = {
					newObj: resultValue,
					cloudValue: cloudValue,
					localVaule: localValue,
					next: null,
				};
				end = end.next;
			} else {
				newObj[key] = cloudValue;
			}
		}
	}
	return result;
}

export async function handleCloud(item, modelConstructor, name) {
	await DataStore.start();
	const storeName = `${name.toLowerCase()}_${name}`;
	db = await idb.openDB(storeName, 2);
	console.log('handling cloud');
	console.log(modelConstructor);
	//const localModel = await DataStore.query(modelConstructor, item.id);
	const localModel = db.get(storeName, item.id);
	console.log('got local model');
	console.log(localModel);
	if (localModel) {
		return handleComplexObjects(item, localModel);
	}
}
