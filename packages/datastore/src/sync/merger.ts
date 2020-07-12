import { Storage } from '../storage/storage';
import {
	ModelInstanceMetadata,
	OpType,
	PersistentModelConstructor,
} from '../types';
import { MutationEventOutbox } from './outbox';

class ModelMerger {
	constructor(
		private readonly outbox: MutationEventOutbox,
		private readonly ownSymbol: Symbol
	) {}

	public async merge<T extends ModelInstanceMetadata>(
		storage: Storage,
		model: T
	): Promise<OpType> {
		let result: OpType;
		const mutationsForModel = await this.outbox.getForModel(storage, model);

		const isDelete = model._deleted;

		if (mutationsForModel.length === 0) {
			if (isDelete) {
				result = OpType.DELETE;
				await storage.delete(model, undefined, this.ownSymbol);
			} else {
				[[, result]] = await storage.save(model, undefined, this.ownSymbol);
			}
		}

		return result;
	}

	public async mergePage(
		storage: Storage,
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[ModelInstanceMetadata, OpType][]> {
		return await storage.batchSave(modelConstructor, items, this.ownSymbol);
	}
}

export { ModelMerger };
