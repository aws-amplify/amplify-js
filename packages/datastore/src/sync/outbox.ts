import { MutationEvent } from './index';
import { ModelPredicateCreator } from '../predicates';
import {
	ExclusiveStorage as Storage,
	StorageFacade,
	Storage as StorageClass,
} from '../storage/storage';
import {
	InternalSchema,
	TypeConstructorMap,
	PersistentModel,
	PersistentModelConstructor,
	QueryOne,
	SchemaModel,
} from '../types';
import { SYNC, objectsEqual } from '../util';
import { TransformerMutationType } from './utils';

// TODO: Persist deleted ids

class MutationEventOutbox {
	private inProgressMutationEventId: string;

	constructor(
		private readonly schema: InternalSchema,
		private readonly userModelClasses: TypeConstructorMap,
		private readonly MutationEvent: PersistentModelConstructor<MutationEvent>,
		private readonly ownSymbol: Symbol,
		private readonly getModelDefinition: (
			modelConstructor: PersistentModelConstructor<any>
		) => SchemaModel
	) {}

	public async enqueue(
		storage: Storage,
		mutationEvent: MutationEvent
	): Promise<void> {
		storage.runExclusive(async s => {
			const mutationEventModelDefinition = this.schema.namespaces[SYNC].models[
				'MutationEvent'
			];

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
					// first gets updated with incoming's data, condition intentionally skipped
					await s.save(
						this.MutationEvent.copyOf(first, draft => {
							draft.data = mutationEvent.data;
						}),
						undefined,
						this.ownSymbol
					);
				}
			} else {
				const { condition: incomingConditionJSON } = mutationEvent;
				const incomingCondition = JSON.parse(incomingConditionJSON);

				// If no condition
				if (Object.keys(incomingCondition).length === 0) {
					// delete all for model
					await s.delete(this.MutationEvent, predicate);
				}

				// Enqueue new one
				await s.save(mutationEvent, undefined, this.ownSymbol);
			}
		});
	}

	public async dequeue(
		storage: StorageClass,
		record?: PersistentModel,
		recordOp?: string
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
	 * Doing a peek() implies that the mutation goes "inProgress"
	 *
	 * @param storage
	 */
	public async peek(storage: StorageFacade): Promise<MutationEvent> {
		const head = await storage.queryOne(this.MutationEvent, QueryOne.FIRST);

		this.inProgressMutationEventId = head ? head.id : undefined;

		return head;
	}

	public async getForModel<T extends PersistentModel>(
		storage: StorageFacade,
		model: T
	): Promise<MutationEvent[]> {
		const mutationEventModelDefinition = this.schema.namespaces[SYNC].models
			.MutationEvent;

		const mutationEvents = await storage.query(
			this.MutationEvent,
			ModelPredicateCreator.createFromExisting(
				mutationEventModelDefinition,
				c => c.modelId('eq', model.id)
			)
		);

		return mutationEvents;
	}

	public async getModelIds(storage: StorageFacade): Promise<Set<string>> {
		const mutationEvents = await storage.query(this.MutationEvent);

		const result = new Set<string>();

		mutationEvents.forEach(({ modelId }) => result.add(modelId));

		return result;
	}

	// applies _version from the AppSync mutation response to other items
	// in the mutation queue with the same id
	// see https://github.com/aws-amplify/amplify-js/pull/7354 for more details
	private async syncOutboxVersionsOnDequeue(
		storage: StorageClass,
		record: PersistentModel,
		head: PersistentModel,
		recordOp: string
	): Promise<void> {
		if (head.operation !== recordOp) {
			return;
		}

		const { _version, _lastChangedAt, _deleted, ...incomingData } = record;

		let data;

		if (recordOp !== TransformerMutationType.UPDATE) {
			data = JSON.parse(head.data);
		} else {
			data = await this.getUpdateRecord(storage, head);
		}

		if (!data) {
			return;
		}

		const {
			_version: __version,
			_lastChangedAt: __lastChangedAt,
			_deleted: __deleted,
			...outgoingData
		} = data;

		// Don't sync the version when the data in the response does not match the data
		// in the request, i.e., when there's a handled conflict
		if (!objectsEqual(incomingData, outgoingData, true)) {
			return;
		}

		const mutationEventModelDefinition = this.schema.namespaces[SYNC].models[
			'MutationEvent'
		];

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

	private async getUpdateRecord(
		storage: StorageClass,
		head: PersistentModel
	): Promise<PersistentModel> {
		const modelConstructor = <PersistentModelConstructor<PersistentModel>>(
			this.userModelClasses[head.model]
		);

		const modelDefinition = this.getModelDefinition(modelConstructor);

		if (!(modelConstructor && head && head.modelId)) {
			return;
		}

		const results = <any>await storage.query(
			modelConstructor,
			ModelPredicateCreator.createFromExisting(modelDefinition, c =>
				c.id('eq', head.modelId)
			)
		);

		const fromDb = results[0];

		// merge data from the mutationEvent with data from the query
		// so that we can perform a comparison to determine whether
		// the request record matches the response
		return { ...fromDb, ...JSON.parse(head.data) };
	}
}

export { MutationEventOutbox };
