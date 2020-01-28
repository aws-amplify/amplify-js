import { MutationEvent } from '.';
import Storage, { StorageFacade } from '../storage/storage';
import {
	InternalSchema,
	NamespaceResolver,
	PersistentModel,
	PersistentModelConstructor,
} from '../types';
declare class MutationEventOutbox {
	private readonly schema;
	private readonly namespaceResolver;
	private readonly MutationEvent;
	private readonly ownSymbol;
	private inProgressMutationEventId;
	constructor(
		schema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		MutationEvent: PersistentModelConstructor<MutationEvent>,
		ownSymbol: Symbol
	);
	enqueue(storage: Storage, mutationEvent: MutationEvent): Promise<void>;
	dequeue(storage: StorageFacade): Promise<MutationEvent>;
	/**
	 * Doing a peek() implies that the mutation goes "inProgress"
	 *
	 * @param storage
	 */
	peek(storage: StorageFacade): Promise<MutationEvent>;
	getForModel<T extends PersistentModel>(
		storage: StorageFacade,
		model: T
	): Promise<MutationEvent[]>;
}
export { MutationEventOutbox };
