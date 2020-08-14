import { PersistentModel } from '../types';
import { ModelPredicateCreator } from '../predicates';
import { ComplexObject } from './';

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
// adds file to record from mutation.ts
// by adding file from complexObjects wherever s3Key seen
export function handleRecord(cloudObject, complexObjects) {
	let count = 0;
	const deepCopy = obj => {
		if (typeof obj !== 'object' || obj === null) {
			return obj;
		}

		const returnObj = Array.isArray(obj) ? [] : {};

		Object.entries(obj).forEach(([key, value]) => {
			if (value instanceof File) {
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
		const fileList = getComplexObjects(localModel, modelDefinition.name);
		return handleRecord(item, fileList);
	}
	// TODO: if no local model exists then download using s3Key
}
