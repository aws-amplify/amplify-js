import { MutationEvent } from './index';
import { ModelPredicateCreator } from '../predicates';
import { ExclusiveStorage as Storage, StorageFacade } from '../storage/storage';
import {
	InternalSchema,
	NamespaceResolver,
	PersistentModel,
	PersistentModelConstructor,
	QueryOne,
} from '../types';
import { SYNC } from '../util';
import { TransformerMutationType } from './utils';

// TODO: Persist deleted ids

class MutationEventOutbox {
	private inProgressMutationEventId: string;

	constructor(
		private readonly schema: InternalSchema,
		private readonly namespaceResolver: NamespaceResolver,
		private readonly MutationEvent: PersistentModelConstructor<MutationEvent>,
		private readonly ownSymbol: Symbol
	) {}

	public async enqueue(
		storage: Storage,
		mutationEvent: MutationEvent
	): Promise<void> {
		storage.runExclusive(async s => {
			const predicate = this.currentPredicate(mutationEvent);
			const existing = await s.query(this.MutationEvent, predicate);
			const [first] = existing;

			if (first === undefined) {
				await s.save(mutationEvent, undefined, this.ownSymbol);
				return;
			}

			const { operation: incomingMutationType } = mutationEvent;

			if (first.operation === TransformerMutationType.CREATE) {
				if (incomingMutationType === TransformerMutationType.DELETE) {
					// get predicate again to avoid race condition with inProgressMutationEventId
					const predicate = this.currentPredicate(mutationEvent);
					// delete all for model
					await s.delete(this.MutationEvent, predicate);
				} else {
					// first gets updated with incoming's data, condition intentionally skiped
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

				const updated = await this.reconcileOutboxOnEnqueue(
					existing,
					mutationEvent
				);

				// If no condition
				if (Object.keys(incomingCondition).length === 0) {
					// get predicate again to avoid race condition with inProgressMutationEventId
					const predicate = this.currentPredicate(mutationEvent);
					// delete all for model
					await s.delete(this.MutationEvent, predicate);
				}

				if (updated) {
					await s.save(updated, undefined, this.ownSymbol);
					return;
				}

				// Enqueue new one
				await s.save(mutationEvent, undefined, this.ownSymbol);
			}
		});
	}

	public async dequeue(
		storage: Storage,
		record?: PersistentModel
	): Promise<MutationEvent> {
		const head = await this.peek(storage);

		if (record) {
			await this.reconcileOutboxOnDequeue(storage, record);
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

	private async reconcileOutboxOnEnqueue(
		existing: MutationEvent[],
		mutationEvent: MutationEvent
	): Promise<MutationEvent | undefined> {
		const { _version, _lastChangedAt } = existing.reduce(
			(acc, cur) => {
				const oldData = JSON.parse(cur.data);
				const { _version: lastVersion } = acc;
				const { _version: _v, _lastChangedAt: _lCA } = oldData;

				if (_v > lastVersion) {
					return { _version: _v, _lastChangedAt: _lCA };
				}

				return acc;
			},
			{
				_version: 0,
				_lastChangedAt: 0,
			}
		);

		const currentData = JSON.parse(mutationEvent.data);
		const currentVersion = currentData._version;

		if (currentVersion < _version) {
			const newData = { ...currentData, _version, _lastChangedAt };
			const newMutation = new this.MutationEvent({
				...mutationEvent,
				data: JSON.stringify(newData),
			});
			return newMutation;
		}
	}

	private async reconcileOutboxOnDequeue(
		storage: Storage,
		record: PersistentModel
	): Promise<void> {
		storage.runExclusive(async s => {
			const mutationEventModelDefinition = this.schema.namespaces[SYNC].models[
				'MutationEvent'
			];

			const predicate = ModelPredicateCreator.createFromExisting<MutationEvent>(
				mutationEventModelDefinition,
				c => c.modelId('eq', record.id).id('ne', this.inProgressMutationEventId)
			);

			const outdatedMutations = await s.query(this.MutationEvent, predicate);

			if (!outdatedMutations.length) {
				return;
			}

			const { _version, _lastChangedAt } = record;

			const reconciledMutations = outdatedMutations.map(m => {
				const oldData = JSON.parse(m.data);

				const newData = { ...oldData, _version, _lastChangedAt };

				return this.MutationEvent.copyOf(m, draft => {
					draft.data = JSON.stringify(newData);
				});
			});

			await s.delete(this.MutationEvent, predicate);

			await Promise.all(
				reconciledMutations.map(
					async m => await s.save(m, undefined, this.ownSymbol)
				)
			);
		});
	}

	private currentPredicate(mutationEvent: MutationEvent) {
		const mutationEventModelDefinition = this.schema.namespaces[SYNC].models[
			'MutationEvent'
		];

		return ModelPredicateCreator.createFromExisting<MutationEvent>(
			mutationEventModelDefinition,
			c =>
				c
					.modelId('eq', mutationEvent.modelId)
					.id('ne', this.inProgressMutationEventId)
		);
	}
}

export { MutationEventOutbox };
