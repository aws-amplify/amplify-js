import Storage from '../storage/storage';
import { ModelInstanceMetadata } from '../types';
import { MutationEventOutbox } from './outbox';

class ModelMerger {
	constructor(
		private readonly outbox: MutationEventOutbox,
		private readonly ownSymbol: Symbol
	) {}

	public async merge<T extends ModelInstanceMetadata>(
		exclusiveStorage: Storage,
		model: T
	): Promise<void> {
		exclusiveStorage.runExclusive(async storage => {
			const mutationsForModel = await this.outbox.getForModel(storage, model);

			const isDelete = model._deleted;

			if (mutationsForModel.length === 0) {
				if (isDelete) {
					await storage.delete(model, undefined, this.ownSymbol);
				} else {
					await storage.save(model, undefined, this.ownSymbol);
				}
			}
		});

		return;
	}
}

export { ModelMerger };
