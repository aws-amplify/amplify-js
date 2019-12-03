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
} from './types';

import { v4 as uuid } from 'uuid';

export const exhaustiveCheck = (obj: never, throwOnError: boolean = true) => {
	if (throwOnError) {
		throw new Error(`Invalid ${obj}`);
	}
};

export const validatePredicate = <T extends PersistentModel>(
	model: T,
	groupType: keyof PredicateGroups<T>,
	predicatesOrGroups: (PredicateObject<T> | PredicatesGroup<T>)[]
) => {
	let filterType: keyof Pick<any[], 'every' | 'some'>;
	let isNegation = false;

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

	if (predicatesOrGroups.length === 0) {
		return true;
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
				});
				if (connectionType === 'BELONGS_TO') {
					relationship[mKey].indexes.push(
						fieldAttribute.association['targetName']
					);
				}
			}
		});
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
