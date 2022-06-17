import { Buffer } from 'buffer';
import { monotonicFactory, ULID } from 'ulid';
import { v4 as uuid } from 'uuid';
import { produce, applyPatches, Patch } from 'immer';
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
	ModelKeys,
	ModelAttributes,
	SchemaNamespace,
	SortPredicatesGroup,
	SortDirection,
	isModelAttributeKey,
	isModelAttributePrimaryKey,
	isModelAttributeCompositeKey,
	NonModelTypeConstructor,
	DeferredCallbackResolverOptions,
	LimitTimerRaceResolvedValues,
} from './types';
import { WordArray } from 'amazon-cognito-identity-js';

/**
 * Intended to provide a build-time assurance that a branch is never followed.
 *
 * Used in `finally` blocks to assure TypeScript that the branch is `never` followed.
 *
 * At runtime, if the `throwOnError` is given as `true`, this function
 * simply raises an error regardless.
 *
 * TODO: As a spike and/or when turning to stricter modes, evaluate whether this function
 * actually does what it is intended to do. Some testing in the datastore-laziness
 * branch suggested this function isn't making the assurances it is intended to.
 *
 * @param obj the object we want to (probably) lie about.
 * @param throwOnError whether to throw an Error at runtime.
 */
export const exhaustiveCheck = (obj: never, throwOnError: boolean = true) => {
	if (throwOnError) {
		throw new Error(`Invalid ${obj}`);
	}
};

/**
 * Tests whether a given value is exactly `null` or `undefined`.
 *
 * @param val value to test.
 * @returns `true` if `null` or `undefined`; false in all other cases.
 */
export const isNullOrUndefined = (val: any): boolean => {
	return typeof val === 'undefined' || val === undefined || val === null;
};

/**
 * Tests whether a model instance matches a predicate.
 *
 * @param model A model instance to test.
 * @param groupType The logical joiner (`and`|`or`|`not`) for the predicate/groups.
 * @param predicatesOrGroups The predicate or list of predicate groups to test with.
 * @returns `true` if the model matches; `false` otherwise.
 */
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

/**
 * Determines whether a value object satisfies a given comparison operator and operand.
 *
 * This is a terminating "leaf step" in testing a model instance against a predicate.
 *
 * @param value A value object to test.
 * @param operator Logical operator/comparison.
 * @param operand Value(s) to compare with.
 * @returns `true` if the value matches; `false` otherwise.
 */
export const validatePredicateField = <T>(
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
			return (
				!isNullOrUndefined(value) &&
				(<string>(<unknown>value)).startsWith(<string>(<unknown>operand))
			);
		case 'contains':
			return (
				!isNullOrUndefined(value) &&
				(<string>(<unknown>value)).indexOf(<string>(<unknown>operand)) > -1
			);
		case 'notContains':
			return (
				isNullOrUndefined(value) ||
				(<string>(<unknown>value)).indexOf(<string>(<unknown>operand)) === -1
			);
		default:
			exhaustiveCheck(operator, false);
			return false;
	}
};

/**
 * Checks whether a given object is a `ModelConstructor` and capable of
 * being used to create model instances that `DataStore` can manage.
 *
 * This test is **primarily useful at build time** for which this assurance
 * is firmly validated by typescript.
 *
 * *At runtime*, **this check is very cheap and shallow**, testing only whether
 * the given object supports `copyOf()`.
 *
 * @param obj object to test.
 * @returns `true` if `obj` is a model constructor.
 */
export const isModelConstructor = <T extends PersistentModel>(
	obj: any
): obj is PersistentModelConstructor<T> => {
	return (
		obj && typeof (<PersistentModelConstructor<T>>obj).copyOf === 'function'
	);
};

const nonModelClasses = new WeakSet<NonModelTypeConstructor<any>>();

export function registerNonModelClass(clazz: NonModelTypeConstructor<any>) {
	nonModelClasses.add(clazz);
}

export const isNonModelConstructor = (
	obj: any
): obj is NonModelTypeConstructor<any> => {
	return nonModelClasses.has(obj);
};

/**
 *
 * When we have GSI(s) with composite sort keys defined on a model
 * There are some very particular rules regarding which fields must be included in the
 * update mutation input. The field selection becomes more complex as the number of GSIs
 * with composite sort keys grows.
 *
 * To summarize: any time we update a field that is part of the composite sort key of a GSI,
 * we must include:
 *
 * 1. all of the other fields in that composite sort key
 * 2. all of the fields from any other composite sort key that intersect with the fields from 1.
 *
 * E.g., for a model containing the following:
 *
 * ```
 * Model @model
 * ... @key(name: 'key1' fields: ['hk', 'a', 'b', 'c'])
 * ... @key(name: 'key2' fields: ['hk', 'a', 'b', 'd'])
 * ... @key(name: 'key3' fields: ['hk', 'x', 'y', 'z'])
 * ... etc. ...
 * ```
 *
 * (Elipses above not part of the schema, but to force VS Code to render graphql correctly.)
 *
 * We expect the following behavior:
 * ```
 * Model.a is updated => include ['a', 'b', 'c', 'd']
 * Model.c is updated => include ['a', 'b', 'c', 'd']
 * Model.d is updated => include ['a', 'b', 'c', 'd']
 * Model.x is updated => include ['x', 'y', 'z']
 * ```
 * This function accepts a model's attributes and returns grouped sets of composite key fields
 * Using our example Model above, the function will return:
 *
 * ```js
 * [
 * 	Set('a', 'b', 'c', 'd'),
 * 	Set('x', 'y', 'z'),
 * ]
 * ```
 *
 * This gives us the opportunity to correctly include the required fields for composite keys
 * When crafting the mutation input in Storage.getUpdateMutationInput
 *
 * @see processCompositeKeys test in util.test.ts for more examples
 *
 * @param attributes
 */
export const processCompositeKeys = (
	attributes: ModelAttributes
): Set<string>[] => {
	const extractCompositeSortKey = ({
		properties: {
			// ignore the HK (fields[0]) we only need to include the composite sort key fields[1...n]
			fields: [, ...sortKeyFields],
		},
	}) => sortKeyFields;

	const compositeKeyFields = attributes
		.filter(isModelAttributeCompositeKey)
		.map(extractCompositeSortKey);

	/*
		if 2 sets of fields have any intersecting fields => combine them into 1 union set
		e.g., ['a', 'b', 'c'] and ['a', 'b', 'd'] => ['a', 'b', 'c', 'd']
	*/
	const combineIntersecting = (fields): Set<string>[] =>
		fields.reduce((combined, sortKeyFields) => {
			const sortKeyFieldsSet = new Set(sortKeyFields);

			if (combined.length === 0) {
				combined.push(sortKeyFieldsSet);
				return combined;
			}

			// does the current set share values with another set we've already added to `combined`?
			const intersectingSetIdx = combined.findIndex(existingSet => {
				return [...existingSet].some(f => sortKeyFieldsSet.has(f));
			});

			if (intersectingSetIdx > -1) {
				const union = new Set([
					...combined[intersectingSetIdx],
					...sortKeyFieldsSet,
				]);
				// combine the current set with the intersecting set we found above
				combined[intersectingSetIdx] = union;
			} else {
				// none of the sets in `combined` have intersecting values with the current set
				combined.push(sortKeyFieldsSet);
			}

			return combined;
		}, []);

	const initial = combineIntersecting(compositeKeyFields);
	// a single pass pay not be enough to correctly combine all the fields
	// call the function once more to get a final merged list of sets
	const combined = combineIntersecting(initial);

	return combined;
};

/**
 * Inspects a namespace to produce a pair of indexes, `[relationships, keys]`.
 *
 * #### Relationships
 *
 * Used to quickly determine what models are related to a given model by name
 * and *how* they're related.
 *
 * ```js
 * { [MODEL_NAME]: [{
 * 	fieldName,
 * 	modelName,
 * 	relationshipType,
 * 	targetName,
 * 	associatedWith
 * }] },
 * ```
 *
 * #### Keys
 *
 * Used to quickly determine what keys are on a model.
 *
 * ```js
 * { [MODEL_NAME]: {
 * 	primaryKey,
 * 	compositeKeys
 * } }
 * ```
 *
 * @param namespace the namespace object to inspect.
 * @returns a tuple, `[relationships, keys]`
 */
export const establishRelationAndKeys = (
	namespace: SchemaNamespace
): [RelationshipType, ModelKeys] => {
	const relationship: RelationshipType = {};
	const keys: ModelKeys = {};

	Object.keys(namespace.models).forEach((mKey: string) => {
		relationship[mKey] = { indexes: [], relationTypes: [] };
		keys[mKey] = {};

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

		if (model.attributes) {
			keys[mKey].compositeKeys = processCompositeKeys(model.attributes);

			for (const attribute of model.attributes) {
				if (!isModelAttributeKey(attribute)) {
					continue;
				}

				if (isModelAttributePrimaryKey(attribute)) {
					keys[mKey].primaryKey = attribute.properties.fields;
				}

				const { fields } = attribute.properties;
				for (const field of fields) {
					// only add index if it hasn't already been added
					const exists = relationship[mKey].indexes.includes(field);
					if (!exists) {
						relationship[mKey].indexes.push(field);
					}
				}
			}
		}
	});

	return [relationship, keys];
};

const topologicallySortedModels = new WeakMap<SchemaNamespace, string[]>();

/**
 *
 * @param srcModelName
 * @param instance
 * @param namespace
 * @param modelInstanceCreator
 * @param getModelConstructorByModelName
 */
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
							console.log(error);
						}

						result.push({
							modelName: rItem.modelName,
							item: instance[rItem.fieldName],
							instance: modelInstance,
						});

						// targetName will be defined for Has One if feature flag
						// https://docs.amplify.aws/cli/reference/feature-flags/#useAppsyncModelgenPlugin
						// is true (default as of 5/7/21)
						// Making this conditional for backward-compatibility
						if (rItem.targetName) {
							(<any>draftInstance)[rItem.targetName] = (<PersistentModel>(
								draftInstance[rItem.fieldName]
							)).id;
							delete draftInstance[rItem.fieldName];
						} else {
							(<any>draftInstance)[rItem.fieldName] = (<PersistentModel>(
								draftInstance[rItem.fieldName]
							)).id;
						}
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

					if (draftInstance[rItem.fieldName]) {
						(<any>draftInstance)[rItem.targetName] = (<PersistentModel>(
							draftInstance[rItem.fieldName]
						)).id;
						delete draftInstance[rItem.fieldName];
					}

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

/**
 * Memoizaton for `isPrivateMode` test.
 *
 * @see isPrivateMode
 */
let privateModeCheckResult;

/**
 * Tests whether IndexedDB is **unavailable**, presumably because the browser
 * is opened in private mode.
 *
 * NOTE: This function is memoized.
 *
 * @returns `true` if `IndexedDB` is **unavailable**, which suggests private mode.
 */
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

const randomBytes = (nBytes: number): Buffer => {
	return Buffer.from(new WordArray().random(nBytes).toString(), 'hex');
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

// deep compare any 2 values
// primitives or object types (including arrays, Sets, and Maps)
// returns true if equal by value
// if nullish is true, treat undefined and null values as equal
// to normalize for GQL response values for undefined fields
export function valuesEqual(
	valA: any,
	valB: any,
	nullish: boolean = false
): boolean {
	let a = valA;
	let b = valB;

	const nullishCompare = (_a, _b) => {
		return (
			(_a === undefined || _a === null) && (_b === undefined || _b === null)
		);
	};

	// if one of the values is a primitive and the other is an object
	if (
		(a instanceof Object && !(b instanceof Object)) ||
		(!(a instanceof Object) && b instanceof Object)
	) {
		return false;
	}

	// compare primitive types
	if (!(a instanceof Object)) {
		if (nullish && nullishCompare(a, b)) {
			return true;
		}

		return a === b;
	}

	// make sure object types match
	if (
		(Array.isArray(a) && !Array.isArray(b)) ||
		(Array.isArray(b) && !Array.isArray(a))
	) {
		return false;
	}

	if (a instanceof Set && b instanceof Set) {
		a = [...a];
		b = [...b];
	}

	if (a instanceof Map && b instanceof Map) {
		a = Object.fromEntries(a);
		b = Object.fromEntries(b);
	}

	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	// last condition is to ensure that [] !== [null] even if nullish. However [undefined] === [null] when nullish
	if (aKeys.length !== bKeys.length && (!nullish || Array.isArray(a))) {
		return false;
	}

	// iterate through the longer set of keys
	// e.g., for a nullish comparison of a={ a: 1 } and b={ a: 1, b: null }
	// we want to iterate through bKeys
	const keys = aKeys.length >= bKeys.length ? aKeys : bKeys;

	for (const key of keys) {
		const aVal = a[key];
		const bVal = b[key];

		if (!valuesEqual(aVal, bVal, nullish)) {
			return false;
		}
	}

	return true;
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

/**
 * A wrapper for a `Promise` that exposes it's `resolve()` and `reject()` functions
 * as instance properties. This can useful for creating promises in a single scope
 * that need to race each other or aggregate callbacks.
 *
 * E.g., we may need to call several endpoints that use callbacks:
 *
 * ```typescript
 * const callback_A = new DeferredPromise();
 * const callback_B = new DeferredPromise();
 *
 * callEndpoint('a', callback_A.resolve);
 * callEndpoint('b', callback_B.resolve);
 * ```
 *
 * And, we may need to wait for both:
 *
 * ```typescript
 * await Promise.all([
 * 	callback_A.promise,
 * 	callback_B.promise
 * ]);
 * ```
 *
 * Or maybe we want the result of whichever finishes first:
 *
 * ```typescript
 * await Promise.race([
 * 	callback_A.promise,
 * 	callback_B.promise
 * ]);
 * ```
 *
 * @see DeferredCallbackResolver
 */
export class DeferredPromise {
	public promise: Promise<string>;
	public resolve: (value: string | PromiseLike<string>) => void;
	public reject: () => void;
	constructor() {
		const self = this;
		this.promise = new Promise(
			(resolve: (value: string | PromiseLike<string>) => void, reject) => {
				self.resolve = resolve;
				self.reject = reject;
			}
		);
	}
}

/**
 * Essentially a timeout for a callback.
 *
 * A callback is provided, which is called within `maxInterval` or when `resolve()`
 * on the `DeferredCallbackResolver` is called &mdash; whichever happens first.
 */
export class DeferredCallbackResolver {
	private limitPromise = new DeferredPromise();
	private timerPromise: Promise<string>;
	private maxInterval: number;
	private timer: ReturnType<typeof setTimeout>;
	private raceInFlight = false;
	private callback = () => {};
	private errorHandler: (error: string) => void;
	private defaultErrorHandler = (
		msg = 'DeferredCallbackResolver error'
	): void => {
		throw new Error(msg);
	};

	constructor(options: DeferredCallbackResolverOptions) {
		this.callback = options.callback;
		this.errorHandler = options.errorHandler || this.defaultErrorHandler;
		this.maxInterval = options.maxInterval || 2000;
	}

	private startTimer(): void {
		this.timerPromise = new Promise((resolve, reject) => {
			this.timer = setTimeout(() => {
				resolve(LimitTimerRaceResolvedValues.TIMER);
			}, this.maxInterval);
		});
	}

	private async racePromises(): Promise<string> {
		let winner: string;
		try {
			this.raceInFlight = true;
			this.startTimer();
			winner = await Promise.race([
				this.timerPromise,
				this.limitPromise.promise,
			]);
			this.callback();
		} catch (err) {
			this.errorHandler(err);
		} finally {
			// reset for the next race
			this.clear();
			this.raceInFlight = false;
			this.limitPromise = new DeferredPromise();

			return winner;
		}
	}

	public start(): void {
		if (!this.raceInFlight) this.racePromises();
	}

	public clear(): void {
		clearTimeout(this.timer);
	}

	public resolve(): void {
		this.limitPromise.resolve(LimitTimerRaceResolvedValues.LIMIT);
	}
}

/**
 * Merge two sets of patches created by immer produce.
 * `newPatches` takes precedence over `oldPatches` for patches modifying the same path.
 * In the case many consecutive pathces are merged the original model should
 * always be the root model.
 *
 * Example:
 *
 * ```
 * A -> B, patches1
 * B -> C, patches2
 * ```
 *
 * `mergePatches(A, patches1, patches2)` to get patches for A -> C
 *
 * @param originalSource the original Model the patches should be applied to
 * @param oldPatches immer produce patch list
 * @param newPatches immer produce patch list (will take precedence)
 * @return merged patches
 */
export function mergePatches<T>(
	originalSource: T,
	oldPatches: Patch[],
	newPatches: Patch[]
): Patch[] {
	const patchesToMerge = oldPatches.concat(newPatches);
	let patches: Patch[];
	produce(
		originalSource,
		draft => {
			applyPatches(draft, patchesToMerge);
		},
		p => {
			patches = p;
		}
	);
	return patches;
}
