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
	cloudObject,
	fileList: Array<ComplexObject>
): Promise<Array<ComplexObject>> {
	console.log('Entered downloadComplexObjects');
	const iterate = async obj => {
		Object.keys(obj).forEach(async key => {
			const isJsonString = tryParseJSON(obj[key]);
			if (isJsonString) {
				if (isJsonString.s3Key) {
					const s3Key = isJsonString.s3Key;
					const result = await storageCategory.get(s3Key, {
						download: true,
					});
					const file = result['Body'];
					fileList.push({ file: file, s3Key: s3Key });
					console.log('we have pushed to fileList');
					console.log(fileList);
					return;
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
			console.log('Here is the key and value');
			console.log(key);
			console.log(value);
			if (value instanceof File || value instanceof Blob) {
				returnObj[key] = value;
			} else {
				const isJsonString = tryParseJSON(value);
				if (isJsonString) {
					console.log('found JSON String');
					console.log(complexObjects);
					console.log('this is count');
					console.log(count);
					const top = complexObjects[count];
					console.log('this is top');
					console.log(top);
					const file = top['file'];
					const s3Key = top['s3Key'];
					console.log('this is the file');
					console.log(file);
					console.log('this is the s3Key');
					console.log(s3Key);
					if (isJsonString.s3Key === s3Key) {
						console.log('there is a match so save');
						returnObj[key] = file;
					}
					console.log("it's saved");
					console.log(returnObj[key]);
					count += 1;
					return;
				}

				returnObj[key] = deepCopy(value);
			}
		});

		return returnObj;
	};
	console.log('here is complexObjects');
	console.log(complexObjects);
	console.log(complexObjects[0]);
	const result = await deepCopy(cloudObject);
	return result;
}

export async function handleCloud(
	storage,
	item,
	modelConstructor,
	modelDefinition
) {
	console.log('into the handle');
	const predicate = ModelPredicateCreator.createForId(modelDefinition, item.id);
	// queries and pulls model that is stored in IDB and has file
	const [localModel] = await storage.query(modelConstructor, predicate);
	if (localModel) {
		const fileList = getComplexObjects(localModel, modelDefinition.name);
		return addComplexObject(item, fileList);
	}
	// if no local model exists then download using s3Key
	else {
		console.log('attempted download');
		console.log(item);
		const complexObjects = await downloadComplexObjects(item, []);
		console.log('here is what complexObjects is ');
		console.log(complexObjects);
		return await addComplexObject(item, complexObjects);
	}
}
