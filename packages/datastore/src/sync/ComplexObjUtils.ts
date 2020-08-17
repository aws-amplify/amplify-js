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
function isEmpty(obj) {
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) return false;
	}
	return true;
}

function getComplexObjects(
	object: PersistentModel,
	model: string
): Array<ComplexObject> {
	const folder = `ComplexObjects/${model}`;
	const fileList = [];

	const iterate = obj => {
		Object.keys(obj).forEach(key => {
			if (obj[key] instanceof File) {
				const file = obj[key];
				const s3Key = `${folder}/${file.name}`;
				fileList.push({ file, s3Key });
				return;
			}

			if (typeof obj[key] === 'object') {
				if (!isEmpty(obj[key])) {
					iterate(obj[key]);
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
	const iterate = async obj => {
		Object.keys(obj).forEach(async key => {
			const isJsonString = tryParseJSON(obj[key]);
			if (isJsonString) {
				if (isJsonString.s3Key) {
					const s3Key = isJsonString.s3Key;
					keys.push(s3Key);
				}
			}
			if (typeof obj[key] === 'object') {
				if (!isEmpty(obj[key])) {
					iterate(obj[key]);
				}
			}
		});
	};
	await iterate(cloudObject);
	const fileList = await Promise.all(
		keys.map(async key => {
			const result = await storageCategory.get(key, {
				download: true,
			});
			const file = result['Body'];
			return { file, s3Key: key };
		})
	);
	return fileList;
}

export async function addComplexObject(cloudObject, complexObjects) {
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
	const result = await deepCopy(cloudObject);
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
		const fileList = getComplexObjects(localModel, modelDefinition.name);
		return addComplexObject(item, fileList);
	}
	// if no local model exists then download using s3Key
	else {
		const complexObjects = await downloadComplexObjects(item);
		return await addComplexObject(item, complexObjects);
	}
}
