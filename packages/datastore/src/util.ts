import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js/core';
import { monotonicFactory, ULID } from 'ulid';
import { v4 as uuid } from 'uuid';
import { ModelInstanceCreator } from './datastore/datastore';
import {
	AllOperators,
	isPredicateGroup,
	isPredicateObj,
	ModelInstanceMetadata,
	PersistentModel,
	PersistentModelConstructor,
	PredicateGroups,
	PredicateObject,
	PredicatesGroup,
	RelationshipType,
	RelationType,
	SchemaNamespace,
	SortPredicatesGroup,
	SortDirection,
} from './types';

export const exhaustiveCheck = (obj: never, throwOnError: boolean = true) => {
	if (throwOnError) {
		throw new Error(`Invalid ${obj}`);
	}
};

export const isNullOrUndefined = (val: any): boolean => {
	return typeof val === 'undefined' || val === undefined || val === null;
};

export const validatePredicate = <T extends PersistentModel>(
	model: T,
	groupType: keyof PredicateGroups<T>,
	predicatesOrGroups: (PredicateObject<T> | PredicatesGroup<T>)[]
) => {
	let filterType: keyof Pick<any[], 'every' | 'some'>;
	let isNegation = false;

	if (predicatesOrGroups.length === 0) {
		return true;
	}

	switch (groupType) {
		case 'not':
			filterType = 'every';
			isNegation = true;
			break;
		case 'and':
			filterType = 'every';
			break;
		case 'or':
			filterType = 'some';
			break;
		default:
			exhaustiveCheck(groupType);
	}

	const result: boolean = predicatesOrGroups[filterType](predicateOrGroup => {
		if (isPredicateObj(predicateOrGroup)) {
			const { field, operator, operand } = predicateOrGroup;
			const value = model[field];

			return validatePredicateField(value, operator, operand);
		}

		if (isPredicateGroup(predicateOrGroup)) {
			const { type, predicates } = predicateOrGroup;
			return validatePredicate(model, type, predicates);
		}

		throw new Error('Not a predicate or group');
	});

	return isNegation ? !result : result;
};

const validatePredicateField = <T>(
	value: T,
	operator: keyof AllOperators,
	operand: T | [T, T]
) => {
	switch (operator) {
		case 'ne':
			return value !== operand;
		case 'eq':
			return value === operand;
		case 'le':
			return value <= operand;
		case 'lt':
			return value < operand;
		case 'ge':
			return value >= operand;
		case 'gt':
			return value > operand;
		case 'between':
			const [min, max] = <[T, T]>operand;
			return value >= min && value <= max;
		case 'beginsWith':
			return (<string>(<unknown>value)).startsWith(<string>(<unknown>operand));
		case 'contains':
			return (
				(<string>(<unknown>value)).indexOf(<string>(<unknown>operand)) > -1
			);
		case 'notContains':
			return (
				(<string>(<unknown>value)).indexOf(<string>(<unknown>operand)) === -1
			);
		default:
			exhaustiveCheck(operator, false);
			return false;
	}
};

export const isModelConstructor = <T extends PersistentModel>(
	obj: any
): obj is PersistentModelConstructor<T> => {
	return (
		obj && typeof (<PersistentModelConstructor<T>>obj).copyOf === 'function'
	);
};

export const establishRelation = (
	namespace: SchemaNamespace
): RelationshipType => {
	const relationship: RelationshipType = {};

	Object.keys(namespace.models).forEach((mKey: string) => {
		relationship[mKey] = { indexes: [], relationTypes: [] };

		const model = namespace.models[mKey];
		Object.keys(model.fields).forEach((attr: string) => {
			const fieldAttribute = model.fields[attr];
			if (
				typeof fieldAttribute.type === 'object' &&
				'model' in fieldAttribute.type
			) {
				const connectionType = fieldAttribute.association.connectionType;
				relationship[mKey].relationTypes.push({
					fieldName: fieldAttribute.name,
					modelName: fieldAttribute.type.model,
					relationType: connectionType,
					targetName: fieldAttribute.association['targetName'],
					associatedWith: fieldAttribute.association['associatedWith'],
				});

				if (connectionType === 'BELONGS_TO') {
					relationship[mKey].indexes.push(
						fieldAttribute.association['targetName']
					);
				}
			}
		});

		// create indexes from key fields
		if (model.attributes) {
			model.attributes.forEach(attribute => {
				if (attribute.type === 'key') {
					const { fields } = attribute.properties;
					if (fields) {
						fields.forEach(field => {
							// only add index if it hasn't already been added
							const exists = relationship[mKey].indexes.includes(field);
							if (!exists) {
								relationship[mKey].indexes.push(field);
							}
						});
					}
				}
			});
		}
	});

	return relationship;
};

const topologicallySortedModels = new WeakMap<SchemaNamespace, string[]>();

export const traverseModel = <T extends PersistentModel>(
	srcModelName: string,
	instance: T,
	namespace: SchemaNamespace,
	modelInstanceCreator: ModelInstanceCreator,
	getModelConstructorByModelName: (
		namsespaceName: string,
		modelName: string
	) => PersistentModelConstructor<any>
) => {
	const relationships = namespace.relationships;
	const modelConstructor = getModelConstructorByModelName(
		namespace.name,
		srcModelName
	);

	const relation = relationships[srcModelName];
	const result: {
		modelName: string;
		item: T;
		instance: T;
	}[] = [];

	const newInstance = modelConstructor.copyOf(instance, draftInstance => {
		relation.relationTypes.forEach((rItem: RelationType) => {
			const modelConstructor = getModelConstructorByModelName(
				namespace.name,
				rItem.modelName
			);

			switch (rItem.relationType) {
				case 'HAS_ONE':
					if (instance[rItem.fieldName]) {
						let modelInstance: T;
						try {
							modelInstance = modelInstanceCreator(
								modelConstructor,
								instance[rItem.fieldName]
							);
						} catch (error) {
							// Do nothing
						}

						result.push({
							modelName: rItem.modelName,
							item: instance[rItem.fieldName],
							instance: modelInstance,
						});

						(<any>draftInstance)[rItem.fieldName] = (<PersistentModel>(
							draftInstance[rItem.fieldName]
						)).id;
					}

					break;
				case 'BELONGS_TO':
					if (instance[rItem.fieldName]) {
						let modelInstance: T;
						try {
							modelInstance = modelInstanceCreator(
								modelConstructor,
								instance[rItem.fieldName]
							);
						} catch (error) {
							// Do nothing
						}

						const isDeleted = (<ModelInstanceMetadata>(
							draftInstance[rItem.fieldName]
						))._deleted;

						if (!isDeleted) {
							result.push({
								modelName: rItem.modelName,
								item: instance[rItem.fieldName],
								instance: modelInstance,
							});
						}
					}

					(<any>draftInstance)[rItem.targetName] = draftInstance[
						rItem.fieldName
					]
						? (<PersistentModel>draftInstance[rItem.fieldName]).id
						: null;

					delete draftInstance[rItem.fieldName];

					break;
				case 'HAS_MANY':
					// Intentionally blank
					break;
				default:
					exhaustiveCheck(rItem.relationType);
					break;
			}
		});
	});

	result.unshift({
		modelName: srcModelName,
		item: newInstance,
		instance: newInstance,
	});

	if (!topologicallySortedModels.has(namespace)) {
		topologicallySortedModels.set(
			namespace,
			Array.from(namespace.modelTopologicalOrdering.keys())
		);
	}

	const sortedModels = topologicallySortedModels.get(namespace);

	result.sort((a, b) => {
		return (
			sortedModels.indexOf(a.modelName) - sortedModels.indexOf(b.modelName)
		);
	});

	return result;
};

export const getIndex = (rel: RelationType[], src: string): string => {
	let index = '';
	rel.some((relItem: RelationType) => {
		if (relItem.modelName === src) {
			index = relItem.targetName;
		}
	});
	return index;
};

export const getIndexFromAssociation = (
	indexes: string[],
	src: string
): string => {
	const index = indexes.find(idx => idx === src);
	return index;
};

export enum NAMESPACES {
	DATASTORE = 'datastore',
	USER = 'user',
	SYNC = 'sync',
	STORAGE = 'storage',
}

const DATASTORE = NAMESPACES.DATASTORE;
const USER = NAMESPACES.USER;
const SYNC = NAMESPACES.SYNC;
const STORAGE = NAMESPACES.STORAGE;

export { USER, SYNC, STORAGE, DATASTORE };

let privateModeCheckResult;

export const isPrivateMode = () => {
	return new Promise(resolve => {
		const dbname = uuid();
		let db;

		const isPrivate = () => {
			privateModeCheckResult = false;

			resolve(true);
		};

		const isNotPrivate = async () => {
			if (db && db.result && typeof db.result.close === 'function') {
				await db.result.close();
			}

			await indexedDB.deleteDatabase(dbname);

			privateModeCheckResult = true;

			return resolve(false);
		};

		if (privateModeCheckResult === true) {
			return isNotPrivate();
		}

		if (privateModeCheckResult === false) {
			return isPrivate();
		}

		if (indexedDB === null) return isPrivate();

		db = indexedDB.open(dbname);
		db.onerror = isPrivate;
		db.onsuccess = isNotPrivate;
	});
};

const randomBytes = function(nBytes: number): Buffer {
	return Buffer.from(CryptoJS.lib.WordArray.random(nBytes).toString(), 'hex');
};
const prng = () => randomBytes(1).readUInt8(0) / 0xff;
export function monotonicUlidFactory(seed?: number): ULID {
	const ulid = monotonicFactory(prng);

	return () => {
		return ulid(seed);
	};
}

/**
 * Uses performance.now() if available, otherwise, uses Date.now() (e.g. react native without a polyfill)
 *
 * The values returned by performance.now() always increase at a constant rate,
 * independent of the system clock (which might be adjusted manually or skewed
 * by software like NTP).
 *
 * Otherwise, performance.timing.navigationStart + performance.now() will be
 * approximately equal to Date.now()
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#Example
 */
export function getNow() {
	if (
		typeof performance !== 'undefined' &&
		performance &&
		typeof performance.now === 'function'
	) {
		return performance.now() | 0; // convert to integer
	} else {
		return Date.now();
	}
}

export function sortCompareFunction<T extends PersistentModel>(
	sortPredicates: SortPredicatesGroup<T>
) {
	return function compareFunction(a, b) {
		// enable multi-field sort by iterating over predicates until
		// a comparison returns -1 or 1
		for (const predicate of sortPredicates) {
			const { field, sortDirection } = predicate;

			// reverse result when direction is descending
			const sortMultiplier = sortDirection === SortDirection.ASCENDING ? 1 : -1;

			if (a[field] < b[field]) {
				return -1 * sortMultiplier;
			}

			if (a[field] > b[field]) {
				return 1 * sortMultiplier;
			}
		}

		return 0;
	};
}

export const isAWSDate = (val: string): boolean => {
	return !!/^\d{4}-\d{2}-\d{2}(Z|[+-]\d{2}:\d{2}($|:\d{2}))?$/.exec(val);
};

export const isAWSTime = (val: string): boolean => {
	return !!/^\d{2}:\d{2}(:\d{2}(.\d+)?)?(Z|[+-]\d{2}:\d{2}($|:\d{2}))?$/.exec(
		val
	);
};

export const isAWSDateTime = (val: string): boolean => {
	return !!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(.\d+)?)?(Z|[+-]\d{2}:\d{2}($|:\d{2}))?$/.exec(
		val
	);
};

export const isAWSTimestamp = (val: number): boolean => {
	return !!/^\d+$/.exec(String(val));
};

export const isAWSEmail = (val: string): boolean => {
	return !!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.exec(
		val
	);
};

export const isAWSJSON = (val: string): boolean => {
	try {
		JSON.parse(val);
		return true;
	} catch {
		return false;
	}
};

export const isAWSURL = (val: string): boolean => {
	try {
		return !!new URL(val);
	} catch {
		return false;
	}
};

export const isAWSPhone = (val: string): boolean => {
	return !!/^\+?\d[\d\s-]+$/.exec(val);
};

export const isAWSIPAddress = (val: string): boolean => {
	return !!/((^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))$)|(^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?$))$/.exec(
		val
	);
};
