// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	PersistentModel,
	ProducerSortPredicate,
	SchemaModel,
	SortDirection,
	SortPredicate,
	SortPredicatesGroup,
} from '../types';

export class ModelSortPredicateCreator {
	private static sortPredicateGroupsMap = new WeakMap<
		SortPredicate<any>,
		SortPredicatesGroup<any>
	>();

	private static createPredicateBuilder<T extends PersistentModel>(
		modelDefinition: SchemaModel,
	) {
		const { name: modelName } = modelDefinition;
		const fieldNames = new Set<keyof T>(Object.keys(modelDefinition.fields));

		const predicate = new Proxy({} as SortPredicate<T>, {
			get(_target, propertyKey, receiver: SortPredicate<T>) {
				const field = propertyKey as keyof T;

				if (!fieldNames.has(field)) {
					throw new Error(
						`Invalid field for model. field: ${String(
							field,
						)}, model: ${modelName}`,
					);
				}

				const result = (sortDirection: SortDirection) => {
					ModelSortPredicateCreator.sortPredicateGroupsMap
						.get(receiver)
						?.push({ field, sortDirection });

					return receiver;
				};

				return result;
			},
		});

		ModelSortPredicateCreator.sortPredicateGroupsMap.set(predicate, []);

		return predicate;
	}

	static isValidPredicate<T extends PersistentModel>(
		predicate: any,
	): predicate is SortPredicate<T> {
		return ModelSortPredicateCreator.sortPredicateGroupsMap.has(predicate);
	}

	static getPredicates<T extends PersistentModel>(
		predicate: SortPredicate<T>,
		throwOnInvalid = true,
	): SortPredicatesGroup<T> {
		if (
			throwOnInvalid &&
			!ModelSortPredicateCreator.isValidPredicate(predicate)
		) {
			throw new Error('The predicate is not valid');
		}

		const predicateGroup =
			ModelSortPredicateCreator.sortPredicateGroupsMap.get(predicate);
		if (predicateGroup) {
			return predicateGroup;
		} else {
			throw new Error('Predicate group not found');
		}
	}

	// transforms cb-style predicate into Proxy
	static createFromExisting<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		existing: ProducerSortPredicate<T>,
	) {
		if (!existing || !modelDefinition) {
			return undefined;
		}

		return existing(
			ModelSortPredicateCreator.createPredicateBuilder(modelDefinition),
		);
	}
}
