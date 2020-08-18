import { PersistentModel } from '../types';
import { ModelPredicateCreator } from '../predicates';
import { ComplexObject } from './';
import { Storage as storageCategory } from '@aws-amplify/storage';

function tryParseJSON(jsonString) {
	try {
		let o = JSON.parse(jsonString);
		if (o && typeof o === 'object') {
			return o;
		}
	} catch (e) {}

	return false;
}

function blobToFile(blob: Blob, fileName: string): File {
	return new File([blob], fileName);
}

export function isEmpty(obj) {
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) return false;
	}
	return true;
}

async function checkForUpdate(cloudObject, complexObjects) {
	let count = 0;
	let keys = [];
	const iterate = obj => {
		Object.entries(obj).forEach(([key, value]) => {
			const isJsonString = tryParseJSON(value);
			if (isJsonString) {
				const { file, s3Key } = complexObjects[count];
				if (isJsonString.s3Key !== s3Key) {
					keys.push(isJsonString.s3Key);
				}
				count += 1;
			}
			if (typeof value === 'object') {
				if (!isEmpty(value)) {
					iterate(value);
				}
			}
		});
	};
	iterate(cloudObject);
	if (!isEmpty(keys)) {
		const fileList = await Promise.all(
			keys.map(async key => {
				const result = await storageCategory.get(key, {
					download: true,
				});
				const file = blobToFile(result['Body'], key.split('/')[2]);
				return { file, s3Key: key };
			})
		);
		return fileList;
	} else {
		return [];
	}
}

function getComplexObjects(
	object: PersistentModel,
	model: string
): Array<ComplexObject> {
	const folder = `ComplexObjects/${model}`;
	const fileList = [];

	const iterate = obj => {
		Object.entries(obj).forEach(([key, value]) => {
			if (value instanceof File) {
				const file = value;
				const s3Key = `${folder}/${file.name}`;
				fileList.push({ file, s3Key });
				return;
			}

			if (typeof value === 'object') {
				if (!isEmpty(value)) {
					iterate(value);
				}
			}
		});
	};

	iterate(object);
	return fileList;
}

async function downloadComplexObjects(
	cloudObject
): Promise<Array<ComplexObject>> {
	const keys = [];
	const iterate = obj => {
		Object.entries(obj).forEach(([key, value]) => {
			const isJsonString = tryParseJSON(value);
			if (isJsonString) {
				if (isJsonString.s3Key) {
					const s3Key = isJsonString.s3Key;
					keys.push(s3Key);
				}
			}
			if (typeof value === 'object') {
				if (!isEmpty(value)) {
					iterate(value);
				}
			}
		});
	};
	iterate(cloudObject);
	const fileList = await Promise.all(
		keys.map(async key => {
			const result = await storageCategory.get(key, {
				download: true,
			});
			const file = blobToFile(result['Body'], key.split('/')[2]);
			return { file, s3Key: key };
		})
	);
	return fileList;
}

async function addComplexObject(cloudObject, complexObjects) {
	let count = 0;
	const deepCopy = obj => {
		if (typeof obj !== 'object' || obj === null) {
			return obj;
		}

		const returnObj = Array.isArray(obj) ? [] : {};

		Object.entries(obj).forEach(([key, value]) => {
			if (value instanceof File || value instanceof Blob) {
				returnObj[key] = value;
			} else {
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
			}
		});

		return returnObj;
	};
	const newModel = await deepCopy(cloudObject);
	return newModel;
}

export async function handleCloud(
	storage,
	item,
	modelConstructor,
	modelDefinition
) {
	let complexObjects;
	const predicate = ModelPredicateCreator.createForId(modelDefinition, item.id);
	// queries and pulls model that is stored in IDB and has file
	const [localModel] = await storage.query(modelConstructor, predicate);
	if (localModel) {
		complexObjects = getComplexObjects(localModel, modelDefinition.name);
		const potential = await checkForUpdate(item, complexObjects);
		if (!isEmpty(potential)) {
			complexObjects = potential;
		}
	}
	// if no local model exists then download using s3Key
	else {
		complexObjects = await downloadComplexObjects(item);
	}
	if (!isEmpty(complexObjects)) {
		return await addComplexObject(item, complexObjects);
	}
}
