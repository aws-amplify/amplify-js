import { PersistentModel } from '../types';
import { ModelPredicateCreator } from '../predicates';

function tryParseJSON(jsonString) {
	try {
		var o = JSON.parse(jsonString);
		if (o && typeof o === 'object') {
			return o;
		}
	} catch (e) {}

	return false;
}

function isEmpty(obj) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) return false;
	}
	return true;
}

function handleComplexObjects(
	cloudObject: PersistentModel,
	localObject: PersistentModel
) {
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
			// if cloudValue and localValue differ
			// Either cloudValue contains {file: s3Key} and localValue {file: File}
			// Both contain a file
			// or they differ on version, lastChanced, deleted
			if (cloudValue !== localValue) {
				if (cloudValue === null || typeof cloudValue === 'number') {
					newObj[key] = cloudValue;
				} else {
					const cloudEntries = Object.entries(cloudValue);
					const localEntries = Object.entries(localValue);

					const [[nestedCloudKey, nestedCloudValue]] = cloudEntries;
					const [[nestedLocalKey, nestedLocalValue]] = localEntries;

					// if both are file just take the cloud
					if (
						nestedCloudValue instanceof File &&
						nestedLocalValue instanceof File
					) {
						newObj[key] = cloudValue;
					}
					// if the nestedCloudValue is an s3Key then take the file
					const isJsonString = tryParseJSON(nestedCloudValue);
					if (isJsonString) {
						if (isJsonString.s3Key && nestedLocalValue instanceof File) {
							newObj[key] = localValue;
						}
					}
				}
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

// adds file to record from mutation.ts
// by adding file from complexObjects wherever s3Key seen
export function handleRecord(
	cloudObject: PersistentModel,
	complexObjects
): PersistentModel {
	let count = 0;
	const deepCopy = obj => {
		if (typeof obj !== 'object' || obj === null) {
			return obj;
		}

		const returnObj = Array.isArray(obj) ? [] : {};

		Object.entries(obj).forEach(([key, value]) => {
			const isJsonString = tryParseJSON(value);
			if (isJsonString) {
				const { file, s3Key } = complexObjects[count];
				if (isJsonString.s3Key === s3Key) {
					returnObj[key] = file;
				}
				count += 1;
				return;
			}

			returnObj[key] = deepCopy(value);
		});

		return returnObj;
	};

	const result = deepCopy(cloudObject);
	return result;
}

export async function handleCloud(
	storage,
	item,
	modelConstructor,
	modelDefinition
) {
	const predicate = ModelPredicateCreator.createForId(modelDefinition, item.id);
	// queries and pulls model that is stored in IDB and has file
	const [localModel] = await storage.query(modelConstructor, predicate);
	if (localModel) {
		return handleComplexObjects(item, localModel);
	}
	// TODO: if no local model exists then download using s3Key
}
