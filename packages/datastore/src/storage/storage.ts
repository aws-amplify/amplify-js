// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Observable, Subject, filter, map } from 'rxjs';
import { Patch } from 'immer';
import { Mutex } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';

import { ModelInstanceCreator } from '../datastore/datastore';
import { ModelPredicateCreator } from '../predicates';
import {
	InternalSchema,
	InternalSubscriptionMessage,
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
	SubscriptionMessage,
	isTargetNameAssociation,
} from '../types';
import {
	NAMESPACES,
	STORAGE,
	isModelConstructor,
	validatePredicate,
	valuesEqual,
} from '../util';
import { getIdentifierValue } from '../sync/utils';

import { Adapter } from './adapter';
import getDefaultAdapter from './adapter/getDefaultAdapter';

export type StorageSubscriptionMessage<T extends PersistentModel> =
	InternalSubscriptionMessage<T> & {
		mutator?: symbol;
	};

export type StorageFacade = Omit<Adapter, 'setUp'>;
export type Storage = InstanceType<typeof StorageClass>;

const logger = new ConsoleLogger('DataStore');
class StorageClass implements StorageFacade {
	private initialized: Promise<void> | undefined;
	private readonly pushStream: Subject<
		StorageSubscriptionMessage<PersistentModel>
	>;

	constructor(
		private readonly schema: InternalSchema,
		private readonly namespaceResolver: NamespaceResolver,
		private readonly getModelConstructorByModelName: (
			namsespaceName: NAMESPACES,
			modelName: string,
		) => PersistentModelConstructor<any>,
		private readonly modelInstanceCreator: ModelInstanceCreator,
		private readonly adapter?: Adapter,
		private readonly sessionId?: string,
	) {
		this.adapter = this.adapter || getDefaultAdapter();
		this.pushStream = new Subject();
	}

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

	async init() {
		if (this.initialized !== undefined) {
			await this.initialized;

			return;
		}
		logger.debug('Starting Storage');

		let resolve: (value?: void | PromiseLike<void>) => void;
		let reject: (value?: void | PromiseLike<void>) => void;

		this.initialized = new Promise<void>((_resolve, _reject) => {
			resolve = _resolve;
			reject = _reject;
		});

		this.adapter!.setUp(
			this.schema,
			this.namespaceResolver,
			this.modelInstanceCreator,
			this.getModelConstructorByModelName,
			this.sessionId,
		).then(resolve!, reject!);

		await this.initialized;
	}

	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: symbol,
		patchesTuple?: [Patch[], PersistentModel],
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		await this.init();
		if (!this.adapter) {
			throw new Error('Storage adapter is missing');
		}

		const result = await this.adapter.save(model, condition);

		result.forEach(r => {
			const [savedElement, opType] = r;

			// truthy when save is called by the Merger
			const syncResponse = !!mutator;

			let updateMutationInput;
			// don't attempt to calc mutation input when storage.save
			// is called by Merger, i.e., when processing an AppSync response
			if (
				(opType === OpType.UPDATE || opType === OpType.INSERT) &&
				!syncResponse
			) {
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

				updateMutationInput = this.getChangedFieldsInput(
					model,
					savedElement,
					patchesTuple,
				);
				// // an update without changed user fields
				// => don't create mutationEvent
				if (updateMutationInput === null) {
					return result;
				}
			}

			const element = updateMutationInput || savedElement;

			const modelConstructor = (Object.getPrototypeOf(savedElement) as object)
				.constructor as PersistentModelConstructor<T>;

			this.pushStream.next({
				model: modelConstructor,
				opType,
				element,
				mutator,
				condition:
					(condition &&
						ModelPredicateCreator.getPredicates(condition, false)) ||
					null,
				savedElement,
			});
		});

		return result;
	}

	delete<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: symbol,
	): Promise<[T[], T[]]>;

	delete<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: symbol,
	): Promise<[T[], T[]]>;

	async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: symbol,
	): Promise<[T[], T[]]> {
		await this.init();
		if (!this.adapter) {
			throw new Error('Storage adapter is missing');
		}

		let models: T[];
		let deleted: T[] | undefined;

		[models, deleted] = await this.adapter.delete(
			modelOrModelConstructor,
			condition,
		);

		const modelConstructor = isModelConstructor(modelOrModelConstructor)
			? modelOrModelConstructor
			: (Object.getPrototypeOf(modelOrModelConstructor || {})
					.constructor as PersistentModelConstructor<T>);
		const namespaceName = this.namespaceResolver(modelConstructor);

		const modelDefinition =
			this.schema.namespaces[namespaceName].models[modelConstructor.name];

		const modelIds = new Set(
			models.map(model => {
				const modelId = getIdentifierValue(modelDefinition, model);

				return modelId;
			}),
		);

		if (
			!isModelConstructor(modelOrModelConstructor) &&
			!Array.isArray(deleted)
		) {
			deleted = [deleted];
		}

		deleted.forEach(model => {
			const resolvedModelConstructor = (Object.getPrototypeOf(model) as object)
				.constructor as PersistentModelConstructor<T>;

			let theCondition: PredicatesGroup<any> | undefined;

			if (!isModelConstructor(modelOrModelConstructor)) {
				const modelId = getIdentifierValue(modelDefinition, model);
				theCondition = modelIds.has(modelId)
					? ModelPredicateCreator.getPredicates(condition!, false)
					: undefined;
			}

			this.pushStream.next({
				model: resolvedModelConstructor,
				opType: OpType.DELETE,
				element: model,
				mutator,
				condition: theCondition || null,
			});
		});

		return [models, deleted];
	}

	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>,
	): Promise<T[]> {
		await this.init();
		if (!this.adapter) {
			throw new Error('Storage adapter is missing');
		}

		return this.adapter.query(modelConstructor, predicate, pagination);
	}

	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST,
	): Promise<T | undefined> {
		await this.init();
		if (!this.adapter) {
			throw new Error('Storage adapter is missing');
		}

		return this.adapter.queryOne(modelConstructor, firstOrLast);
	}

	observe<T extends PersistentModel>(
		modelConstructor?: PersistentModelConstructor<T> | null,
		predicate?: ModelPredicate<T> | null,
		skipOwn?: symbol,
	): Observable<SubscriptionMessage<T>> {
		const listenToAll = !modelConstructor;
		const { predicates, type } =
			(predicate && ModelPredicateCreator.getPredicates(predicate, false)) ||
			{};

		let result = this.pushStream
			.pipe(
				filter(({ mutator }) => {
					return !skipOwn || mutator !== skipOwn;
				}),
			)
			.pipe(
				map(
					({ mutator: _mutator, ...message }) =>
						message as SubscriptionMessage<T>,
				),
			);

		if (!listenToAll) {
			result = result.pipe(
				filter(({ model, element }) => {
					if (modelConstructor !== model) {
						return false;
					}

					if (!!predicates && !!type) {
						return validatePredicate(element, type, predicates);
					}

					return true;
				}),
			);
		}

		return result;
	}

	async clear(completeObservable = true) {
		this.initialized = undefined;
		if (!this.adapter) {
			throw new Error('Storage adapter is missing');
		}

		await this.adapter.clear();

		if (completeObservable) {
			this.pushStream.complete();
		}
	}

	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[],
		mutator?: symbol,
	): Promise<[T, OpType][]> {
		await this.init();
		if (!this.adapter) {
			throw new Error('Storage adapter is missing');
		}

		const result = await this.adapter.batchSave(modelConstructor, items);

		result.forEach(([element, opType]) => {
			this.pushStream.next({
				model: modelConstructor,
				opType,
				element,
				mutator,
				condition: null,
			});
		});

		return result;
	}

	// returns null if no user fields were changed (determined by value comparison)
	private getChangedFieldsInput<T extends PersistentModel>(
		model: T,
		originalElement: T,
		patchesTuple?: [Patch[], PersistentModel],
	): PersistentModel | null {
		const containsPatches = patchesTuple && patchesTuple.length;
		if (!containsPatches) {
			return null;
		}

		const [patches, source] = patchesTuple!;
		const updatedElement = {};
		// extract array of updated fields from patches
		const updatedFields = patches.map(
			patch => patch.path && patch.path[0],
		) as string[];

		// check model def for association and replace with targetName if exists
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const namespace = this.namespaceResolver(modelConstructor);
		const { fields } =
			this.schema.namespaces[namespace].models[modelConstructor.name];
		const { primaryKey, compositeKeys = [] } =
			this.schema.namespaces[namespace].keys?.[modelConstructor.name] || {};

		// set original values for these fields
		updatedFields.forEach((field: string) => {
			const targetNames: any = isTargetNameAssociation(
				fields[field]?.association,
			);

			if (Array.isArray(targetNames)) {
				// if field refers to a belongsTo relation, use the target field instead

				for (const targetName of targetNames) {
					// check field values by value. Ignore unchanged fields
					if (!valuesEqual(source[targetName], originalElement[targetName])) {
						// if the field was updated to 'undefined', replace with 'null' for compatibility with JSON and GraphQL

						updatedElement[targetName] =
							originalElement[targetName] === undefined
								? null
								: originalElement[targetName];

						for (const fieldSet of compositeKeys) {
							// include all of the fields that comprise the composite key
							if (fieldSet.has(targetName)) {
								for (const compositeField of fieldSet) {
									updatedElement[compositeField] =
										originalElement[compositeField];
								}
							}
						}
					}
				}
			} else {
				// Backwards compatibility pre-CPK

				// if field refers to a belongsTo relation, use the target field instead
				const key = targetNames || field;

				// check field values by value. Ignore unchanged fields
				if (!valuesEqual(source[key], originalElement[key])) {
					// if the field was updated to 'undefined', replace with 'null' for compatibility with JSON and GraphQL

					updatedElement[key] =
						originalElement[key] === undefined ? null : originalElement[key];

					for (const fieldSet of compositeKeys) {
						// include all of the fields that comprise the composite key
						if (fieldSet.has(key)) {
							for (const compositeField of fieldSet) {
								updatedElement[compositeField] =
									originalElement[compositeField];
							}
						}
					}
				}
			}
		});

		// Exit early when there are no changes introduced in the update mutation
		if (Object.keys(updatedElement).length === 0) {
			return null;
		}

		// include field(s) from custom PK if one is specified for the model
		if (primaryKey && primaryKey.length) {
			for (const pkField of primaryKey) {
				updatedElement[pkField] = originalElement[pkField];
			}
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

class ExclusiveStorage implements StorageFacade {
	private storage: StorageClass;
	private readonly mutex = new Mutex();
	constructor(
		schema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		getModelConstructorByModelName: (
			namsespaceName: NAMESPACES,
			modelName: string,
		) => PersistentModelConstructor<any>,
		modelInstanceCreator: ModelInstanceCreator,
		adapter?: Adapter,
		sessionId?: string,
	) {
		this.storage = new StorageClass(
			schema,
			namespaceResolver,
			getModelConstructorByModelName,
			modelInstanceCreator,
			adapter,
			sessionId,
		);
	}

	runExclusive<T>(fn: (storage: StorageClass) => Promise<T>) {
		return this.mutex.runExclusive(fn.bind(this, this.storage)) as Promise<T>;
	}

	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: symbol,
		patchesTuple?: [Patch[], PersistentModel],
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		return this.runExclusive<[T, OpType.INSERT | OpType.UPDATE][]>(storage =>
			storage.save(model, condition, mutator, patchesTuple),
		);
	}

	async delete<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: symbol,
	): Promise<[T[], T[]]>;

	async delete<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: symbol,
	): Promise<[T[], T[]]>;

	async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: symbol,
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
		pagination?: PaginationInput<T>,
	): Promise<T[]> {
		return this.runExclusive<T[]>(storage =>
			storage.query<T>(modelConstructor, predicate, pagination),
		);
	}

	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST,
	): Promise<T | undefined> {
		return this.runExclusive<T | undefined>(storage =>
			storage.queryOne<T>(modelConstructor, firstOrLast),
		);
	}

	static getNamespace() {
		return StorageClass.getNamespace();
	}

	observe<T extends PersistentModel>(
		modelConstructor?: PersistentModelConstructor<T> | null,
		predicate?: ModelPredicate<T> | null,
		skipOwn?: symbol,
	): Observable<SubscriptionMessage<T>> {
		return this.storage.observe(modelConstructor, predicate, skipOwn);
	}

	async clear() {
		await this.runExclusive(storage => storage.clear());
	}

	batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		items: ModelInstanceMetadata[],
	): Promise<[T, OpType][]> {
		return this.storage.batchSave(modelConstructor, items);
	}

	async init() {
		return this.storage.init();
	}
}

export { ExclusiveStorage };
