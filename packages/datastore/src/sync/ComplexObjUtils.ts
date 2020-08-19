import { PersistentModel } from '../types';
import { ModelPredicateCreator } from '../predicates';
import { ComplexObject } from './';
import { Storage as storageCategory } from '@aws-amplify/storage';
import CryptoJS from 'crypto-js/core';
import md5 from 'crypto-js/md5';

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

async function fileToArrayBuffer(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.addEventListener('load', () => {
			resolve(reader.result);
		});

		reader.addEventListener('error', error => {
			reject(error);
		});

		reader.readAsArrayBuffer(file);
	});
}
async function getEtag(blob) {
	const keys = [blob];
	const fileList = await Promise.all(
		keys.map(async key => {
			const buf = await fileToArrayBuffer(blob);
			var wordArray = CryptoJS.lib.WordArray.create(buf);
			const out = md5(wordArray).toString();
			return out;
		})
	);
	return fileList[0];
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
				const { file, s3Key, eTag } = complexObjects[count];
				if (isJsonString.eTag !== eTag) {
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
				const eTag = await getEtag(file);
				return { file, s3Key: key, eTag };
			})
		);
		return fileList;
	} else {
		return [];
	}
}

async function getComplexObjects(
	object: PersistentModel,
	model: string
): Promise<Array<ComplexObject>> {
	const folder = `ComplexObjects/${model}`;
	const fileList = [];

	const iterate = obj => {
		Object.entries(obj).forEach(async ([key, value]) => {
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

	const newList = await Promise.all(
		fileList.map(async key => {
			const file = key['file'];
			const s3Key = key['s3Key'];
			const eTag = await getEtag(file);
			return { file, s3Key, eTag };
		})
	);

	return newList;
}

async function downloadComplexObjects(cloudObject) {
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
			const complexObject = await storageCategory
				.get(key, {
					download: true,
				})
				.then(result => {
					const file = blobToFile(result['Body'], key.split('/')[2]);
					return { file, s3Key: key };
				})
				.catch(err => {
					// If 404 error, file not in S3 Bucket, return nothing as the item is of type DELETE
					return;
				});
			return complexObject;
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
					const { file, s3Key, eTag } = complexObjects[count];
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

function handleHelper(object: PersistentModel, model: string) {
	const folder = `ComplexObjects/${model}`;
	const fileList = [];

	const iterate = obj => {
		Object.entries(obj).forEach(async ([key, value]) => {
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

export async function handleLocal(
	object: PersistentModel,
	model: string
): Promise<[PersistentModel, Array<ComplexObject>]> {
	const folder = `ComplexObjects/${model}`;
	let count = 0;

	const deepCopy = async obj => {
		if (typeof obj !== 'object' || obj === null) {
			return obj;
		}

		const returnObj = Array.isArray(obj) ? [] : {};

		Object.entries(obj).forEach(async ([key, value]) => {
			if (value instanceof File) {
				const { file, s3Key, eTag } = newList[count];
				count += 1;
				returnObj[key] = JSON.stringify({ s3Key, eTag });
				return;
			}

			returnObj[key] = await deepCopy(value);
		});

		return returnObj;
	};
	const complexObjects = handleHelper(object, model);
	const newList = await Promise.all(
		complexObjects.map(async key => {
			const file = key['file'];
			const s3Key = key['s3Key'];
			const eTag = await getEtag(file);
			return { file, s3Key, eTag };
		})
	);
	const result = await deepCopy(object);
	return [result, newList];
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
		complexObjects = await getComplexObjects(localModel, modelDefinition.name);
		const potential = await checkForUpdate(item, complexObjects);
		if (!isEmpty(potential)) {
			complexObjects = potential;
		}
	}
	// if no local model exists and item is not being deleted then download using s3Key
	else {
		if (!item['_deleted']) {
			complexObjects = await downloadComplexObjects(item);
			// If complexObjects contains undefined item's file not in S3
			if (complexObjects[0] === undefined) {
				return item;
			}
		} else {
			return item;
		}
	}
	if (!isEmpty(complexObjects)) {
		return await addComplexObject(item, complexObjects);
	} else {
		return item;
	}
}
