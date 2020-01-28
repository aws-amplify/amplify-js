import Storage from '../storage/storage';
import { ModelInstanceMetadata } from '../types';
import { MutationEventOutbox } from './outbox';
declare class ModelMerger {
	private readonly outbox;
	private readonly ownSymbol;
	constructor(outbox: MutationEventOutbox, ownSymbol: Symbol);
	merge<T extends ModelInstanceMetadata>(
		exclusiveStorage: Storage,
		model: T
	): Promise<void>;
}
export { ModelMerger };
