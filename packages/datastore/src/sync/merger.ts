import { Storage } from '../storage/storage';
import {
	extractPrimaryKeyFieldNames,
	ModelInstanceMetadata,
	OpType,
	PersistentModelConstructor,
} from '../types';
import { MutationEventOutbox } from './outbox';
import { SchemaModel } from '../types';
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

	// TODO: explain mergePage
	public async mergePage(
		storage: Storage,
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[],
		modelDefinition: SchemaModel
	): Promise<[ModelInstanceMetadata, OpType][]> {
		const itemsMap: Map<string, ModelInstanceMetadata> = new Map();

		for (const item of items) {
			// merge items by model id. Latest record for a given id remains.
			let modelId; // TODO rename
			const pk = extractPrimaryKeyFieldNames(modelDefinition);

			const itemId = item?.id;

			if (!itemId) {
				// TODO: extract all keys
				modelId = item[pk[0]];
			} else {
				modelId = item.id;
			}

			itemsMap.set(modelId, item);
		}

		const page = [...itemsMap.values()];

		return await storage.batchSave(modelConstructor, page, this.ownSymbol);
	}
}

export { ModelMerger };
