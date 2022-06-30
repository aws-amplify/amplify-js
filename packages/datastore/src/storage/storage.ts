import { Logger, Mutex } from '@aws-amplify/core';
import Observable, { ZenObservable } from 'zen-observable-ts';
import PushStream from 'zen-push';
import { Patch } from 'immer';
import { ModelInstanceCreator } from '../datastore/datastore';
import { ModelPredicateCreator } from '../predicates';
import {
	InternalSchema,
	ModelInstanceMetadata,
	ModelPredicate,
	NamespaceResolver,
	OpType,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	PredicatesGroup,
	QueryOne,
	SchemaNamespace,
	InternalSubscriptionMessage,
	SubscriptionMessage,
	isTargetNameAssociation,
} from '../types';
import {
	isModelConstructor,
	STORAGE,
	validatePredicate,
	valuesEqual,
} from '../util';
import { Adapter } from './adapter';
import getDefaultAdapter from './adapter/getDefaultAdapter';

export type StorageSubscriptionMessage<T extends PersistentModel> =
	InternalSubscriptionMessage<T> & {
		mutator?: Symbol;
	};
export type StorageFacade = Omit<Adapter, 'setUp'>;
export type Storage = InstanceType<typeof StorageClass>;

const logger = new Logger('DataStore');

/**
 * A wrapper that manages a storage adapter and provides common functionality, such
 * as observability, that would otherwise need to be implemented in each individual adapter.
 */
class StorageClass implements StorageFacade {
	private initialized: Promise<void>;

	/**
	 * The inner observable-like thing (`PushStream`) that collects all data
	 * operations and provides a "deferred" and "multi-cast-like" API. I.e.:
	 *
	 * `pushStream` can produce an `observable` via `.observable`, and items
	 * can be broadcast to all generated observables (subscribers) by calling
	 * `.next(item)` on the `PushStream`.
	 *
	 * @see https://www.npmjs.com/package/zen-push
	 */
	private readonly pushStream: {
		observable: Observable<StorageSubscriptionMessage<PersistentModel>>;
	} & Required<
		ZenObservable.Observer<StorageSubscriptionMessage<PersistentModel>>
	>;

	/**
	 * Constructs a
	 * @param schema This schema will be initialized against the storage adapter.
	 * @param namespaceResolver Used to separate collections of models and avoid name conflicts.
	 * @param getModelConstructorByModelName A function to find the model constructor for a model by namespace and name.
	 * @param modelInstanceCreator
	 * @param adapter The storage adapter to use as a final local persistence layer.
	 * @param sessionId
	 */
	constructor(
		private readonly schema: InternalSchema,
		private readonly namespaceResolver: NamespaceResolver,
		private readonly getModelConstructorByModelName: (
			namsespaceName: string,
			modelName: string
		) => PersistentModelConstructor<any>,
		private readonly modelInstanceCreator: ModelInstanceCreator,
		private readonly adapter?: Adapter,
		private readonly sessionId?: string
	) {
		this.adapter = this.adapter || getDefaultAdapter();
		this.pushStream = new PushStream();
	}

	/**
	 * The namespace for STORAGE tables.
	 */
	static getNamespace() {
		const namespace: SchemaNamespace = {
			name: STORAGE,
			relationships: {},
			enums: {},
			models: {},
			nonModels: {},
		};

		return namespace;
	}

	/**
	 * If not already initalized, hands off schema and sessionId to the storage adapter
	 * and `awaits` downstream/inner initialization.
	 */
	async init() {
		// Using `this.initialized` and local `resolve` and `reject` vars to essentially connect
		// these promises together and prevent re-invocations of `this.adapter.setUp()`.
		//
		// Can this be done more simply like this?
		//
		// this.initialized = this.initialized ?? this.adapter.setUp(...);
		// return this.initialized;
		//
		// Or am I overlooking something?

		if (this.initialized !== undefined) {
			await this.initialized;
			return;
		}
		logger.debug('Starting Storage');

		let resolve: (value?: void | PromiseLike<void>) => void;
		let reject: (value?: void | PromiseLike<void>) => void;
		this.initialized = new Promise<void>((res, rej) => {
			resolve = res;
			reject = rej;
		});

		this.adapter
			.setUp(
				this.schema,
				this.namespaceResolver,
				this.modelInstanceCreator,
				this.getModelConstructorByModelName,
				this.sessionId
			)
			.then(resolve, reject);

		await this.initialized;
	}

	/**
	 * Saves the model intance against the underlying adapter and broadcasts the
	 * update to observers.
	 *
	 * SIDE EFFECT:
	 * 1. Sends an event to observers.
	 * 1. Updates local state via local adapter.
	 *
	 * Messages sent to observers may or may not have resolved when this method
	 * returns.
	 *
	 * @param model The model instance to save.
	 * @param condition The conditions under which the save should succeed.
	 * Omission attempts to save unconditionally.
	 * @param mutator
	 * @param patchesTuple
	 */
	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: Symbol,
		patchesTuple?: [Patch[], PersistentModel]
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		await this.init();

		const result = await this.adapter.save(model, condition);

		result.forEach(r => {
			const [savedElement, opType] = r;

			// truthy when save is called by the Merger
			const syncResponse = !!mutator;

			let updateMutationInput;
			// don't attempt to calc mutation input when storage.save
			// is called by Merger, i.e., when processing an AppSync response
			if (opType === OpType.UPDATE && !syncResponse) {
				//
				// TODO: LOOK!!!
				// the `model` used here is in effect regardless of what model
				// comes back from adapter.save().
				// Prior to fix, SQLite adapter had been returning two models
				// of different types, resulting in invalid outbox entries.
				//
				// the bug is essentially fixed in SQLite adapter.
				// leaving as-is, because it's currently unclear whether anything
				// depends on this remaining as-is.
				//

				updateMutationInput = this.getUpdateMutationInput(
					model,
					savedElement,
					patchesTuple
				);
				// // an update without changed user fields
				// => don't create mutationEvent
				if (updateMutationInput === null) {
					return result;
				}
			}

			const element = updateMutationInput || savedElement;

			const modelConstructor = (Object.getPrototypeOf(savedElement) as Object)
				.constructor as PersistentModelConstructor<T>;

			this.pushStream.next({
				model: modelConstructor,
				opType,
				element,
				mutator,
				condition: ModelPredicateCreator.getPredicates(condition, false),
				savedElement,
			});
		});

		return result;
	}

	delete<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]>;
	delete<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]>;
	async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]> {
		await this.init();

		let deleted: T[];
		let models: T[];

		[models, deleted] = await this.adapter.delete(
			modelOrModelConstructor,
			condition
		);

		const modelIds = new Set(models.map(({ id }) => id));

		if (
			!isModelConstructor(modelOrModelConstructor) &&
			!Array.isArray(deleted)
		) {
			deleted = [deleted];
		}

		deleted.forEach(model => {
			const modelConstructor = (Object.getPrototypeOf(model) as Object)
				.constructor as PersistentModelConstructor<T>;

			let theCondition: PredicatesGroup<any>;

			if (!isModelConstructor(modelOrModelConstructor)) {
				theCondition = modelIds.has(model.id)
					? ModelPredicateCreator.getPredicates(condition, false)
					: undefined;
			}

			this.pushStream.next({
				model: modelConstructor,
				opType: OpType.DELETE,
				element: model,
				mutator,
				condition: theCondition,
			});
		});

		return [models, deleted];
	}

	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]> {
		await this.init();

		return await this.adapter.query(modelConstructor, predicate, pagination);
	}

	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST
	): Promise<T> {
		await this.init();

		const record = await this.adapter.queryOne(modelConstructor, firstOrLast);
		return record;
	}

	observe<T extends PersistentModel>(
		modelConstructor?: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		skipOwn?: Symbol
	): Observable<SubscriptionMessage<T>> {
		const listenToAll = !modelConstructor;
		const { predicates, type } =
			ModelPredicateCreator.getPredicates(predicate, false) || {};
		const hasPredicate = !!predicates;

		let result = this.pushStream.observable
			.filter(({ mutator }) => {
				return !skipOwn || mutator !== skipOwn;
			})
			.map(
				({ mutator: _mutator, ...message }) => message as SubscriptionMessage<T>
			);

		if (!listenToAll) {
			result = result.filter(({ model, element }) => {
				if (modelConstructor !== model) {
					return false;
				}

				if (hasPredicate) {
					return validatePredicate(element, type, predicates);
				}

				return true;
			});
		}

		return result;
	}

	async clear(completeObservable = true) {
		this.initialized = undefined;

		await this.adapter.clear();

		if (completeObservable) {
			this.pushStream.complete();
		}
	}

	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[],
		mutator?: Symbol
	): Promise<[T, OpType][]> {
		await this.init();

		const result = await this.adapter.batchSave(modelConstructor, items);

		result.forEach(([element, opType]) => {
			this.pushStream.next({
				model: modelConstructor,
				opType,
				element,
				mutator,
				condition: undefined,
			});
		});

		return result as any;
	}

	// returns null if no user fields were changed (determined by value comparison)
	private getUpdateMutationInput<T extends PersistentModel>(
		model: T,
		originalElement: T,
		patchesTuple?: [Patch[], PersistentModel]
	): PersistentModel | null {
		const containsPatches = patchesTuple && patchesTuple.length;
		if (!containsPatches) {
			return null;
		}

		const [patches, source] = patchesTuple;
		const updatedElement = {};
		// extract array of updated fields from patches
		const updatedFields = <string[]>(
			patches.map(patch => patch.path && patch.path[0])
		);

		// check model def for association and replace with targetName if exists
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const namespace = this.namespaceResolver(modelConstructor);
		const { fields } =
			this.schema.namespaces[namespace].models[modelConstructor.name];
		const { primaryKey, compositeKeys = [] } =
			this.schema.namespaces[namespace].keys[modelConstructor.name];

		// set original values for these fields
		updatedFields.forEach((field: string) => {
			const targetName: any = isTargetNameAssociation(
				fields[field]?.association
			);

			// if field refers to a belongsTo relation, use the target field instead
			const key = targetName || field;

			// check field values by value. Ignore unchanged fields
			if (!valuesEqual(source[key], originalElement[key])) {
				// if the field was updated to 'undefined', replace with 'null' for compatibility with JSON and GraphQL
				updatedElement[key] =
					originalElement[key] === undefined ? null : originalElement[key];

				for (const fieldSet of compositeKeys) {
					// include all of the fields that comprise the composite key
					if (fieldSet.has(key)) {
						for (const compositeField of fieldSet) {
							updatedElement[compositeField] = originalElement[compositeField];
						}
					}
				}
			}
		});

		// include field(s) from custom PK if one is specified for the model
		if (primaryKey && primaryKey.length) {
			for (const pkField of primaryKey) {
				updatedElement[pkField] = originalElement[pkField];
			}
		}

		if (Object.keys(updatedElement).length === 0) {
			return null;
		}

		const { id, _version, _lastChangedAt, _deleted } = originalElement;

		// For update mutations we only want to send fields with changes
		// and the required internal fields
		return {
			...updatedElement,
			id,
			_version,
			_lastChangedAt,
			_deleted,
		};
	}
}

/**
 * Enforces linearity of data access calls to a storage adapter as managed by the Storage class.
 * Uses a mutex
 *
 * @see StorageClass
 */
class ExclusiveStorage implements StorageFacade {
	private storage: StorageClass;
	private readonly mutex = new Mutex();
	constructor(
		schema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		getModelConstructorByModelName: (
			namsespaceName: string,
			modelName: string
		) => PersistentModelConstructor<any>,
		modelInstanceCreator: ModelInstanceCreator,
		adapter?: Adapter,
		sessionId?: string
	) {
		this.storage = new StorageClass(
			schema,
			namespaceResolver,
			getModelConstructorByModelName,
			modelInstanceCreator,
			adapter,
			sessionId
		);
	}

	/**
	 * Runs a function under an exclusive lock against the storage layer.
	 *
	 * Used by all data access methods functions in the `ExclusiveStorage` layer.
	 *
	 * SIDE EFFECT: Acquires a lock on `this` and doesn't let go until the function completes.
	 *
	 * @param fn The function to run.
	 * @returns The result of the function.
	 */
	runExclusive<T>(fn: (storage: StorageClass) => Promise<T>) {
		return <Promise<T>>this.mutex.runExclusive(fn.bind(this, this.storage));
	}

	/**
	 *
	 * @param model
	 * @param condition
	 * @param mutator
	 * @param patchesTuple
	 */
	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: Symbol,
		patchesTuple?: [Patch[], PersistentModel]
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		return this.runExclusive<[T, OpType.INSERT | OpType.UPDATE][]>(storage =>
			storage.save<T>(model, condition, mutator, patchesTuple)
		);
	}

	async delete<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]>;
	async delete<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]>;
	async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]> {
		return this.runExclusive<[T[], T[]]>(storage => {
			if (isModelConstructor(modelOrModelConstructor)) {
				const modelConstructor = modelOrModelConstructor;

				return storage.delete(modelConstructor, condition, mutator);
			} else {
				const model = modelOrModelConstructor;

				return storage.delete(model, condition, mutator);
			}
		});
	}

	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]> {
		return this.runExclusive<T[]>(storage =>
			storage.query<T>(modelConstructor, predicate, pagination)
		);
	}

	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST
	): Promise<T> {
		return this.runExclusive<T>(storage =>
			storage.queryOne<T>(modelConstructor, firstOrLast)
		);
	}

	static getNamespace() {
		return StorageClass.getNamespace();
	}

	observe<T extends PersistentModel>(
		modelConstructor?: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		skipOwn?: Symbol
	): Observable<SubscriptionMessage<T>> {
		return this.storage.observe(modelConstructor, predicate, skipOwn);
	}

	async clear() {
		await this.storage.clear();
	}

	batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]> {
		return this.storage.batchSave(modelConstructor, items);
	}

	async init() {
		return this.storage.init();
	}
}

export { ExclusiveStorage };
