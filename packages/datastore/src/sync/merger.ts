import { Storage } from '../storage/storage';
import {
	extractPrimaryKeyFieldNames,
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
		// debugger;
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
		const itemsMap: Map<string, ModelInstanceMetadata> = new Map();
		// debugger;

		for (const item of items) {
			// merge items by model id. Latest record for a given id remains.

			// const pk = extractPrimaryKeyFieldNames(item);

			// if (!element.id) {
			// 	// TODO:
			// 	modelId = element[pk[0]];
			// } else {
			// 	modelId = element.id;
			// }

			// TODO get model def from modelConstructor
			// pass through schema?
			// or getModelDefinition (only used in DS, may not be best solution)
			// roll your own?
			// reduce into single string for all pks?
			debugger;
			itemsMap.set(item.id, item);
		}

		// debugger;

		const page = [...itemsMap.values()];

		return await storage.batchSave(modelConstructor, page, this.ownSymbol);
	}
}

export { ModelMerger };
