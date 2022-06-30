import { MutationEvent } from './index';
import { ModelPredicateCreator } from '../predicates';
import {
	ExclusiveStorage as Storage,
	StorageFacade,
	Storage as StorageClass,
} from '../storage/storage';
import { ModelInstanceCreator } from '../datastore/datastore';
import {
	InternalSchema,
	PersistentModel,
	PersistentModelConstructor,
	QueryOne,
} from '../types';
import { USER, SYNC, valuesEqual } from '../util';
import { TransformerMutationType } from './utils';

// TODO: Persist deleted ids
// https://github.com/aws-amplify/amplify-js/blob/datastore-docs/packages/datastore/docs/sync-engine.md#outbox
class MutationEventOutbox {
	private inProgressMutationEventId: string;

	constructor(
		private readonly schema: InternalSchema,
		private readonly MutationEvent: PersistentModelConstructor<MutationEvent>,
		private readonly modelInstanceCreator: ModelInstanceCreator,
		private readonly ownSymbol: Symbol
	) {}

	public async enqueue(
		storage: Storage,
		mutationEvent: MutationEvent
	): Promise<void> {
		storage.runExclusive(async s => {
			const mutationEventModelDefinition =
				this.schema.namespaces[SYNC].models['MutationEvent'];

			const predicate = ModelPredicateCreator.createFromExisting<MutationEvent>(
				mutationEventModelDefinition,
				c =>
					c
						.modelId('eq', mutationEvent.modelId)
						.id('ne', this.inProgressMutationEventId)
			);

			const [first] = await s.query(this.MutationEvent, predicate);

			if (first === undefined) {
				await s.save(mutationEvent, undefined, this.ownSymbol);
				return;
			}

			const { operation: incomingMutationType } = mutationEvent;

			if (first.operation === TransformerMutationType.CREATE) {
				if (incomingMutationType === TransformerMutationType.DELETE) {
					await s.delete(this.MutationEvent, predicate);
				} else {
					// first gets updated with the incoming mutation's data, condition intentionally skipped

					// we need to merge the fields for a create and update mutation to prevent
					// data loss, since update mutations only include changed fields
					const merged = this.mergeUserFields(first, mutationEvent);
					await s.save(
						this.MutationEvent.copyOf(first, draft => {
							draft.data = merged.data;
						}),
						undefined,
						this.ownSymbol
					);
				}
			} else {
				const { condition: incomingConditionJSON } = mutationEvent;
				const incomingCondition = JSON.parse(incomingConditionJSON);
				let merged: MutationEvent;

				// If no condition
				if (Object.keys(incomingCondition).length === 0) {
					merged = this.mergeUserFields(first, mutationEvent);

					// delete all for model
					await s.delete(this.MutationEvent, predicate);
				}

				merged = merged || mutationEvent;

				// Enqueue new one
				await s.save(merged, undefined, this.ownSymbol);
			}
		});
	}

	/**
	 *
	 * @param storage
	 * @param record
	 * @param recordOp
	 */
	public async dequeue(
		storage: StorageClass,
		record?: PersistentModel,
		recordOp?: TransformerMutationType
	): Promise<MutationEvent> {
		const head = await this.peek(storage);

		if (record) {
			await this.syncOutboxVersionsOnDequeue(storage, record, head, recordOp);
		}

		await storage.delete(head);
		this.inProgressMutationEventId = undefined;

		return head;
	}

	/**
	 * Fetches and returns the "head" item from the queue without removing it,
	 * and records the head item as the item in progress.
	 *
	 * SIDE EFFECT:
	 * 1. If there is an item at the head of the queue, the items `id` is
	 * saved to `this.inProgressMutationEventId`.
	 *
	 * @param storage The storage mechanism the queue lives in.
	 * @returns The head item.
	 */
	public async peek(storage: StorageFacade): Promise<MutationEvent> {
		const head = await storage.queryOne(this.MutationEvent, QueryOne.FIRST);

		this.inProgressMutationEventId = head ? head.id : undefined;

		return head;
	}

	/**
	 * Gets the list of mutation events waiting to be sent to AppSync for a
	 * given model instance.
	 *
	 * Intended to manage merging items in the outbox.
	 *
	 * @param storage The storage adapter managing the outbox.
	 * @param model The model instance to search for.
	 * @returns Array of mutations in the outbox for the model instance.
	 */
	public async getForModel<T extends PersistentModel>(
		storage: StorageFacade,
		model: T
	): Promise<MutationEvent[]> {
		const mutationEventModelDefinition =
			this.schema.namespaces[SYNC].models.MutationEvent;

		const mutationEvents = await storage.query(
			this.MutationEvent,
			ModelPredicateCreator.createFromExisting(
				mutationEventModelDefinition,
				c => c.modelId('eq', model.id)
			)
		);

		return mutationEvents;
	}

	/**
	 * Gets the full set of modelId's present in the outbox.
	 *
	 * @param storage The storage adapter managing the outbox.
	 * @returns A list of ID's.
	 */
	public async getModelIds(storage: StorageFacade): Promise<Set<string>> {
		const mutationEvents = await storage.query(this.MutationEvent);

		const result = new Set<string>();

		mutationEvents.forEach(({ modelId }) => result.add(modelId));

		return result;
	}

	/**
	 * Applies `_version` from the AppSync mutation response to other items
	 * in the mutation queue with the same `id`.
	 *
	 * @see https://github.com/aws-amplify/amplify-js/pull/7354 for more details
	 *
	 * @param storage The storage mechanism the queue lives in.
	 * @param record The record from appsync to update the queue with.
	 * @param head The
	 * @param recordOp
	 */
	private async syncOutboxVersionsOnDequeue(
		storage: StorageClass,
		record: PersistentModel,
		head: PersistentModel,
		recordOp: string
	): Promise<void> {
		if (head.operation !== recordOp) {
			return;
		}

		const { _version, _lastChangedAt, _deleted, ..._incomingData } = record;
		const incomingData = this.removeTimestampFields(head.model, _incomingData);

		const data = JSON.parse(head.data);

		if (!data) {
			return;
		}

		const {
			_version: __version,
			_lastChangedAt: __lastChangedAt,
			_deleted: __deleted,
			..._outgoingData
		} = data;
		const outgoingData = this.removeTimestampFields(head.model, _outgoingData);

		// Don't sync the version when the data in the response does not match the data
		// in the request, i.e., when there's a handled conflict
		if (!valuesEqual(incomingData, outgoingData, true)) {
			return;
		}

		const mutationEventModelDefinition =
			this.schema.namespaces[SYNC].models['MutationEvent'];

		const predicate = ModelPredicateCreator.createFromExisting<MutationEvent>(
			mutationEventModelDefinition,
			c => c.modelId('eq', record.id).id('ne', this.inProgressMutationEventId)
		);

		const outdatedMutations = await storage.query(
			this.MutationEvent,
			predicate
		);

		if (!outdatedMutations.length) {
			return;
		}

		const reconciledMutations = outdatedMutations.map(m => {
			const oldData = JSON.parse(m.data);

			const newData = { ...oldData, _version, _lastChangedAt };

			return this.MutationEvent.copyOf(m, draft => {
				draft.data = JSON.stringify(newData);
			});
		});

		await storage.delete(this.MutationEvent, predicate);

		await Promise.all(
			reconciledMutations.map(
				async m => await storage.save(m, undefined, this.ownSymbol)
			)
		);
	}

	/**
	 *
	 * @param previous
	 * @param current
	 */
	private mergeUserFields(
		previous: MutationEvent,
		current: MutationEvent
	): MutationEvent {
		const { _version, id, _lastChangedAt, _deleted, ...previousData } =
			JSON.parse(previous.data);

		const {
			id: __id,
			_version: __version,
			_lastChangedAt: __lastChangedAt,
			_deleted: __deleted,
			...currentData
		} = JSON.parse(current.data);

		const data = JSON.stringify({
			id,
			_version,
			_lastChangedAt,
			_deleted,
			...previousData,
			...currentData,
		});

		return this.modelInstanceCreator(this.MutationEvent, {
			...current,
			data,
		});
	}

	/**
	 * Deletes created and updated at timestamp fields from a model instance.
	 *
	 * If a schema overrides thes name fields for a model, those will be
	 * deleted instead. E.g., from a schema json:
	 *
	 * ```
	 * 	"attributes": [
	 * 	{
	 * 		"type": "model",
	 *  		"properties": {
	 * 				"timestamps": {
	 * 				"createdAt": "createdOn",
	 * 				"updatedAt": "updatedOn"
	 * 			}
	 * 		}
	 * 	}
	 * ]
	 * ```
	 *
	 * @param model The model name.
	 * @param record The model instance.
	 * @returns
	 */
	private removeTimestampFields(
		model: string,
		record: PersistentModel
	): PersistentModel {
		const CREATED_AT_DEFAULT_KEY = 'createdAt';
		const UPDATED_AT_DEFAULT_KEY = 'updatedAt';

		let createdTimestampKey = CREATED_AT_DEFAULT_KEY;
		let updatedTimestampKey = UPDATED_AT_DEFAULT_KEY;

		const modelAttributes = this.schema.namespaces[USER].models[
			model
		].attributes?.find(attr => attr.type === 'model');
		const timestampFieldsMap = modelAttributes?.properties?.timestamps;

		if (timestampFieldsMap) {
			createdTimestampKey = timestampFieldsMap[CREATED_AT_DEFAULT_KEY];
			updatedTimestampKey = timestampFieldsMap[UPDATED_AT_DEFAULT_KEY];
		}

		delete (record as Record<string, any>)[createdTimestampKey];
		delete (record as Record<string, any>)[updatedTimestampKey];

		return record;
	}
}

export { MutationEventOutbox };
