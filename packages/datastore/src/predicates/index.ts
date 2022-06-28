import {
	AllOperators,
	ModelPredicate,
	PersistentModel,
	PredicateExpression,
	PredicateGroups,
	PredicatesGroup,
	ProducerModelPredicate,
	SchemaModel,
} from '../types';
import { exhaustiveCheck } from '../util';

export { ModelSortPredicateCreator } from './sort';

/**
 * Container for all predicates produced with `Predicates.ALL`.
 * Used for quickly determining if a predicate is a `Predicates.ALL`.
 */
const predicatesAllSet = new WeakSet<ProducerModelPredicate<any>>();

/**
 * Determines whether a given predicate is *clearly known* to be generated
 * from `Predicates.ALL`.
 *
 * This may be useful to know for some optimizations.
 *
 * @param predicate the predicate to test
 * @returns `true` if *known* `Predicate.ALL` and `false` otherwise.
 */
export function isPredicatesAll(
	predicate: any
): predicate is typeof PredicateAll {
	return predicatesAllSet.has(predicate);
}

/**
 * A symbol used exclusively for its type.
 */
export const PredicateAll = Symbol('A predicate that matches all records');

/**
 * Namespace class for common predicate generators.
 *
 * Currently used to expose `Predicates.ALL`.
 */
export class Predicates {
	/**
	 * Produces a predicate that matches all records.
	 */
	public static get ALL(): typeof PredicateAll {
		const predicate = <ProducerModelPredicate<any>>(c => c);
		predicatesAllSet.add(predicate);
		return <typeof PredicateAll>(<unknown>predicate);
	}
}

/**
 * Namespace class for predicate creation functions.
 */
export class ModelPredicateCreator {
	/**
	 * Maps predicate nodes to logical predicate groups (and/or/not).
	 *
	 * As predicates are built up, they essentially form a tree. This map
	 * allows us to take a node (like an 'eq' condition) and fetch the subtree
	 * the node is attached to.
	 *
	 * This is essentially an alternative to putting a reference from each node
	 * in the predicate tree to its parent.
	 */
	private static predicateGroupsMap = new WeakMap<
		ModelPredicate<any>,
		PredicatesGroup<any>
	>();

	/**
	 * Creates a predicate builder for use against a model managed by DataStore. The builder is
	 * provided as the second argument to DataStore `save()`, `query()`, or `delete()` when a
	 * predicate function is given. E.g.,
	 *
	 * ```ts
	 * const items = await DataStore.query(
	 * 	MyModel,
	 * 	predicateBuilder => predicateBuilder.name('contains', 'Jones')
	 * );
	 * ```
	 *
	 * This function returns the `predicateBuilder` like the one used above, and creates
	 * a "hidden" `and` logical group (and/or/not), which is stored in a static WeakMap
	 * (`predicateGroupsMap`) and is used to accumulate downstream predicates / conditions.
	 *
	 * SIDE EFFECT: Records predicate -> group entries in a static WeakMap.
	 *
	 * @param modelDefinition model definition which the predicate is intended to test.
	 */
	private static createPredicateBuilder<T extends PersistentModel>(
		modelDefinition: SchemaModel
	) {
		const { name: modelName } = modelDefinition;
		const fieldNames = new Set<keyof T>(Object.keys(modelDefinition.fields));

		let handler: ProxyHandler<ModelPredicate<T>>;
		const predicate = new Proxy(
			{} as ModelPredicate<T>,
			(handler = {
				get(
					_target,
					propertyKey,
					receiver: ModelPredicate<T>
				): PredicateExpression<T, any> {
					const groupType = propertyKey as keyof PredicateGroups<T>;

					// If the property key being accessed is a logical grouping type, we
					// will create a new predicate builder with a new implicit logical group
					// to accumulate subsequent predicate conditions.
					switch (groupType) {
						case 'and':
						case 'or':
						case 'not':
							const result: PredicateExpression<T, any> = (
								newPredicate: (criteria: ModelPredicate<T>) => ModelPredicate<T>
							) => {
								const group: PredicatesGroup<T> = {
									type: groupType,
									predicates: [],
								};

								// Create a new recorder
								const tmpPredicateRecorder = new Proxy(
									{} as ModelPredicate<T>,
									handler
								);

								// Set the recorder group
								ModelPredicateCreator.predicateGroupsMap.set(
									tmpPredicateRecorder,
									group
								);

								// Apply the predicates to the recorder (this is the step that records the changes)
								newPredicate(tmpPredicateRecorder);

								// Push the group to the top-level recorder
								ModelPredicateCreator.predicateGroupsMap
									.get(receiver)
									.predicates.push(group);

								return receiver;
							};

							return result;
						default:
							exhaustiveCheck(groupType, false);
					}

					// if the given property is *not* a logical grouping, we add the condition
					// to the currently scoped logical group.

					const field = propertyKey as keyof T;

					if (!fieldNames.has(field)) {
						throw new Error(
							`Invalid field for model. field: ${field}, model: ${modelName}`
						);
					}

					const result: PredicateExpression<T, any> = (
						operator: keyof AllOperators,
						operand: any
					) => {
						ModelPredicateCreator.predicateGroupsMap
							.get(receiver)
							.predicates.push({ field, operator, operand });
						return receiver;
					};
					return result;
				},
			})
		);

		const group: PredicatesGroup<T> = {
			type: 'and',
			predicates: [],
		};
		ModelPredicateCreator.predicateGroupsMap.set(predicate, group);

		return predicate;
	}

	/**
	 * Determines whether a given object can be used as a predicate.
	 *
	 * @param predicate The object to test.
	 * @returns `true` if the object is a predicate.
	 */
	static isValidPredicate<T extends PersistentModel>(
		predicate: any
	): predicate is ModelPredicate<T> {
		return ModelPredicateCreator.predicateGroupsMap.has(predicate);
	}

	/**
	 * Takes a predicate leaf and returns the implicit, containing logical
	 * group (and/or/not), which will then contain the sibling predicates.
	 *
	 * @param predicate The predicate to lookup.
	 * @param throwOnInvalid Whether a missing predicate group shoud result
	 * in an error.
	 * @returns The logical group / predicate subtree.
	 */
	static getPredicates<T extends PersistentModel>(
		predicate: ModelPredicate<T>,
		throwOnInvalid: boolean = true
	) {
		if (throwOnInvalid && !ModelPredicateCreator.isValidPredicate(predicate)) {
			throw new Error('The predicate is not valid');
		}

		return ModelPredicateCreator.predicateGroupsMap.get(predicate);
	}

	/**
	 * Injects the predicate `builder` object into an app-level predicate
	 * builder function like this:
	 *
	 * ```
	 * builder => builder.field('eq', 'whatever')
	 * ```
	 *
	 * ... and *executes* the function to produce a `ModelPredicate<T>`, which
	 * can then be used by adapters for searching and filtering.
	 *
	 * @param modelDefinition A Model type to generate the predicate for.
	 * @param existing The app-level predicate function.
	 * @returns a traversable predicate tree.
	 */
	static createFromExisting<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		existing: ProducerModelPredicate<T>
	) {
		if (!existing || !modelDefinition) {
			return undefined;
		}

		return existing(
			ModelPredicateCreator.createPredicateBuilder(modelDefinition)
		);
	}

	/**
	 * Creates a predicate that simply searches or filters a model type by a
	 * given `id` value.
	 *
	 * @param modelDefinition A model type to search.
	 * @param id The id to search for.
	 * @returns A predicate that matches the model by the given id.
	 */
	static createForId<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		id: string
	) {
		return ModelPredicateCreator.createPredicateBuilder<T>(modelDefinition).id(
			'eq',
			<any>id
		);
	}
}
