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
	SchemaModel,
	ModelAttribute,
	IndexesType,
} from './types';
import { WordArray } from 'amazon-cognito-identity-js';

const ID = 'id';

export const DEFAULT_PRIMARY_KEY_SEPARATOR = '#';

export const IDENTIFIER_VALUE_SEPARATOR = '-';

export const errorMessages = {
	idEmptyString: 'An index field cannot contain an empty string value',
	queryByPkWithCompositeKeyPresent:
		'Models with composite primary keys cannot be queried by a single key value. Use object literal syntax for composite keys instead: https://docs.amplify.aws/lib/datastore/advanced-workflows/q/platform/js/#querying-records-with-custom-primary-keys',
	deleteByPkWithCompositeKeyPresent:
		'Models with composite primary keys cannot be deleted by a single key value, unless using a predicate. Use object literal syntax for composite keys instead: https://docs.amplify.aws/lib/datastore/advanced-workflows/q/platform/js/#querying-records-with-custom-primary-keys',
	observeWithObjectLiteral:
		'Object literal syntax cannot be used with observe. Use a predicate instead: https://docs.amplify.aws/lib/datastore/data-access/q/platform/js/#predicates',
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
export const USER_AGENT_SUFFIX_DATASTORE = '/DataStore';

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
							console.log(error);
						}

						result.push({
							modelName: rItem.modelName,
							item: instance[rItem.fieldName],
							instance: modelInstance,
						});

						const targetNames: string[] | undefined =
							extractTargetNamesFromSrc(rItem);

						// `targetName` will be defined for Has One if feature flag
						// https://docs.amplify.aws/cli/reference/feature-flags/#useAppsyncModelgenPlugin
						// is true (default as of 5/7/21)
						// Making this conditional for backward-compatibility
						if (targetNames) {
							targetNames.forEach((targetName, idx) => {
								// Get the connected record
								const relatedRecordInProxy = <PersistentModel>(
									draftInstance[rItem.fieldName]
								);

								// Previously, we used the hardcoded 'id' as they key,
								// now we need the value of the key to get the PK (and SK)
								// values from the related record

								const { primaryKey } = namespace.keys[modelConstructor.name];
								const keyField = primaryKey && primaryKey[idx];

								// Get the value
								const relatedRecordInProxyPkValue =
									relatedRecordInProxy[keyField];

								// Set the targetName value
								(<any>draftInstance)[targetName] = relatedRecordInProxyPkValue;
							});
							// Delete the instance from the proxy
							delete (<any>draftInstance)[rItem.fieldName];
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
						const targetNames: string[] | undefined =
							extractTargetNamesFromSrc(rItem);

						if (targetNames) {
							targetNames.forEach((targetName, idx) => {
								// Get the connected record
								const relatedRecordInProxy = <PersistentModel>(
									draftInstance[rItem.fieldName]
								);
								// Previously, we used the hardcoded `id` for the key.
								// Now, we need the value of the key to get the PK (and SK)
								// values from the related record
								const { primaryKey } = namespace.keys[modelConstructor.name];

								// fall back to ID if
								const keyField = primaryKey && primaryKey[idx];

								// Get the value
								const relatedRecordInProxyPkValue =
									relatedRecordInProxy[keyField];

								// Set the targetName value
								(<any>draftInstance)[targetName] = relatedRecordInProxyPkValue;
							});
							// Delete the instance from the proxy
							delete (<any>draftInstance)[rItem.fieldName];
						}
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
 * merge two sets of patches created by immer produce.
 * newPatches take precedent over oldPatches for patches modifying the same path.
 * In the case many consecutive pathces are merged the original model should
 * always be the root model.
 *
 * Example:
 * A -> B, patches1
 * B -> C, patches2
 *
 * mergePatches(A, patches1, patches2) to get patches for A -> C
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

export const getStorename = (namespace: string, modelName: string) => {
	const storeName = `${namespace}_${modelName}`;

	return storeName;
};

//#region Key Utils

/*
  When we have GSI(s) with composite sort keys defined on a model
	There are some very particular rules regarding which fields must be included in the update mutation input
	The field selection becomes more complex as the number of GSIs with composite sort keys grows

	To summarize: any time we update a field that is part of the composite sort key of a GSI, we must include:
	 1. all of the other fields in that composite sort key
	 2. all of the fields from any other composite sort key that intersect with the fields from 1.

	 E.g.,
	 Model @model
		@key(name: 'key1' fields: ['hk', 'a', 'b', 'c'])
		@key(name: 'key2' fields: ['hk', 'a', 'b', 'd'])
		@key(name: 'key3' fields: ['hk', 'x', 'y', 'z'])

	Model.a is updated => include ['a', 'b', 'c', 'd']
	Model.c is updated => include ['a', 'b', 'c', 'd']
	Model.d is updated => include ['a', 'b', 'c', 'd']
	Model.x is updated => include ['x', 'y', 'z']

	This function accepts a model's attributes and returns grouped sets of composite key fields
	Using our example Model above, the function will return:
	[
		Set('a', 'b', 'c', 'd'),
		Set('x', 'y', 'z'),
	]

	This gives us the opportunity to correctly include the required fields for composite keys
	When crafting the mutation input in Storage.getUpdateMutationInput

	See 'processCompositeKeys' test in util.test.ts for more examples
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

export const extractKeyIfExists = (
	modelDefinition: SchemaModel
): ModelAttribute | undefined => {
	const keyAttribute = modelDefinition?.attributes?.find(isModelAttributeKey);

	return keyAttribute;
};

export const extractPrimaryKeyFieldNames = (
	modelDefinition: SchemaModel
): string[] => {
	const keyAttribute = extractKeyIfExists(modelDefinition);
	if (keyAttribute && isModelAttributePrimaryKey(keyAttribute)) {
		return keyAttribute.properties.fields;
	}

	return [ID];
};

export const extractPrimaryKeyValues = <T extends PersistentModel>(
	model: T,
	keyFields: string[]
): string[] => {
	return keyFields.map(key => model[key]);
};

export const extractPrimaryKeysAndValues = <T extends PersistentModel>(
	model: T,
	keyFields: string[]
): any => {
	const primaryKeysAndValues = {};
	keyFields.forEach(key => (primaryKeysAndValues[key] = model[key]));
	return primaryKeysAndValues;
};

// IdentifierFields<ManagedIdentifier>
// Default behavior without explicit @primaryKey defined
export const isIdManaged = (modelDefinition: SchemaModel): boolean => {
	const keyAttribute = extractKeyIfExists(modelDefinition);

	if (keyAttribute && isModelAttributePrimaryKey(keyAttribute)) {
		return false;
	}

	return true;
};

// IdentifierFields<OptionallyManagedIdentifier>
// @primaryKey with explicit `id` in the PK. Single key or composite
export const isIdOptionallyManaged = (
	modelDefinition: SchemaModel
): boolean => {
	const keyAttribute = extractKeyIfExists(modelDefinition);

	if (keyAttribute && isModelAttributePrimaryKey(keyAttribute)) {
		return keyAttribute.properties.fields[0] === ID;
	}

	return false;
};

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
					targetNames: fieldAttribute.association['targetNames'],
					associatedWith: fieldAttribute.association['associatedWith'],
				});

				if (connectionType === 'BELONGS_TO') {
					const targetNames = extractTargetNamesFromSrc(
						fieldAttribute.association
					);

					if (targetNames) {
						const idxName = indexNameFromKeys(targetNames);
						relationship[mKey].indexes.push([idxName, targetNames]);
					}
				}
			}
		});

		if (model.attributes) {
			keys[mKey].compositeKeys = processCompositeKeys(model.attributes);

			for (const attribute of model.attributes) {
				if (!isModelAttributeKey(attribute)) {
					continue;
				}

				const { fields } = attribute.properties;

				if (isModelAttributePrimaryKey(attribute)) {
					keys[mKey].primaryKey = fields;
					continue;
				}

				// create indexes for all other keys
				const idxName = indexNameFromKeys(fields);
				const idxExists = relationship[mKey].indexes.find(
					([index]) => index === idxName
				);

				if (!idxExists) {
					relationship[mKey].indexes.push([idxName, fields]);
				}
			}
		}

		// set 'id' as the PK for models without a custom PK explicitly defined
		if (!keys[mKey].primaryKey) {
			keys[mKey].primaryKey = [ID];
		}

		// create primary index
		relationship[mKey].indexes.push([
			'byPk',
			keys[mKey].primaryKey as string[],
			{ unique: true },
		]);
	});

	return [relationship, keys];
};

export const getIndex = (
	rel: RelationType[],
	src: string
): string | undefined => {
	let indexName;
	rel.some((relItem: RelationType) => {
		if (relItem.modelName === src) {
			const targetNames = extractTargetNamesFromSrc(relItem);
			indexName = targetNames && indexNameFromKeys(targetNames);
			return true;
		}
	});
	return indexName;
};

export const getIndexFromAssociation = (
	indexes: IndexesType,
	src: string | string[]
): string | undefined => {
	let indexName: string;

	if (Array.isArray(src)) {
		indexName = indexNameFromKeys(src);
	} else {
		indexName = src;
	}

	const associationIndex = indexes.find(([idxName]) => idxName === indexName);
	return associationIndex && associationIndex[0];
};

/* Backwards-compatability for schema generated prior to custom primary key support:
the single field `targetName` has been replaced with an array of `targetNames`
*/
export const extractTargetNamesFromSrc = (src: any): string[] | undefined => {
	const targetName = src?.targetName;
	const targetNames = src?.targetNames;

	if (Array.isArray(targetNames) && targetNames?.length) {
		return targetNames;
	} else if (typeof targetName === 'string') {
		return [targetName];
	} else {
		return undefined;
	}
};

// Generates spinal-cased index name from an array of key field names
// E.g. for keys `[id, title]` => 'id-title'
export const indexNameFromKeys = (keys: string[]): string => {
	return keys.reduce((prev: string, cur: string, idx: number) => {
		if (idx === 0) {
			return cur;
		}
		return `${prev}${IDENTIFIER_VALUE_SEPARATOR}${cur}`;
	}, '');
};

export const keysEqual = (keysA, keysB): boolean => {
	if (keysA.length !== keysB.length) {
		return false;
	}

	return keysA.every((key, idx) => key === keysB[idx]);
};

// Returns primary keys for a model
export const getIndexKeys = (
	namespace: SchemaNamespace,
	modelName: string
): string[] => {
	const keyPath = namespace?.keys[modelName]?.primaryKey;

	if (keyPath) {
		return keyPath;
	}

	return ['id'];
};

//#endregion
