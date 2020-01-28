import {
	ModelPredicate,
	PersistentModel,
	PredicatesGroup,
	ProducerModelPredicate,
	SchemaModel,
} from '../types';
export declare function isPredicatesAll(
	predicate: ProducerModelPredicate<any>
): boolean;
export declare class Predicates {
	static readonly ALL: ProducerModelPredicate<any>;
}
export declare class ModelPredicateCreator {
	private static predicateGroupsMap;
	private static createPredicateBuilder;
	static isValidPredicate<T extends PersistentModel>(
		predicate: any
	): predicate is ModelPredicate<T>;
	static getPredicates<T extends PersistentModel>(
		predicate: ModelPredicate<T>,
		throwOnInvalid?: boolean
	): PredicatesGroup<any>;
	static createFromExisting<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		existing: ProducerModelPredicate<T>
	): ModelPredicate<T>;
	static createForId<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		id: string
	): ModelPredicate<T>;
}
