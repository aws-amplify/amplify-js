// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Storage } from '../storage/storage';
import {
	ModelInstanceMetadata,
	OpType,
	PersistentModelConstructor,
	SchemaModel,
} from '../types';

import { MutationEventOutbox } from './outbox';
import { getIdentifierValue } from './utils';

// https://github.com/aws-amplify/amplify-js/blob/datastore-docs/packages/datastore/docs/sync-engine.md#merger
class ModelMerger {
	constructor(
		private readonly outbox: MutationEventOutbox,
		private readonly ownSymbol: symbol,
	) {}

	/**
	 *
	 * @param storage Storage adapter that contains the data.
	 * @param model The model from an outbox mutation.
	 * @returns The type of operation (INSERT/UPDATE/DELETE)
	 */
	public async merge<T extends ModelInstanceMetadata>(
		storage: Storage,
		model: T,
		modelDefinition: SchemaModel,
	): Promise<OpType> {
		let result: OpType;
		const mutationsForModel = await this.outbox.getForModel(
			storage,
			model,
			modelDefinition,
		);

		const isDelete = model._deleted;

		if (mutationsForModel.length === 0) {
			if (isDelete) {
				result = OpType.DELETE;
				await storage.delete(model, undefined, this.ownSymbol);
			} else {
				[[, result]] = await storage.save(model, undefined, this.ownSymbol);
			}
		}

		return result!;
	}

	public async mergePage(
		storage: Storage,
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[],
		modelDefinition: SchemaModel,
	): Promise<[ModelInstanceMetadata, OpType][]> {
		const itemsMap = new Map<string, ModelInstanceMetadata>();

		for (const item of items) {
			// merge items by model id. Latest record for a given id remains.
			const modelId = getIdentifierValue(modelDefinition, item);

			itemsMap.set(modelId, item);
		}

		const page = [...itemsMap.values()];

		return storage.batchSave(modelConstructor, page, this.ownSymbol);
	}
}

export { ModelMerger };
