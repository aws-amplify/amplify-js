import {
	ModelInstanceMetadata,
	ModelPredicate,
	OpType,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	QueryOne,
	SystemComponent,
} from '../../types';

/**
 * The interface used for interacting with local storage.
 */
export interface Adapter extends SystemComponent {
	/**
	 * Closes and fully deletes the database.
	 *
	 * This is destructive and non-reversable. To add data again, a fully new
	 * database must be created.
	 *
	 * SIDE EFFECT:
	 * 1. Changes storage adapter state/schema/data.
	 */
	clear(): Promise<void>;

	/**
	 * Saves a model instance to the adapter, populating, locally generated
	 * fields such as `id` as-needed.
	 *
	 * SIDE EFFECT:
	 * 1. Changes storage adapter data/state.
	 * 1. Adapters with support will create a local transaction.
	 *
	 * @param model The model instance to save.
	 * @param condition The conditions under which the save should succeed.
	 * Omission attempts to save unconditionally.
	 * @returns The a tuple of the saved model and operation type
	 * (INSERT/UPDATE) needed to affect the save. The returned model
	 * includes the new `id` field if one had to be generated.
	 */
	save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]>;

	/**
	 * Removes a model instance or instances and all other instances that have
	 * a FK from the adapter
	 *
	 * SIDE EFFECT:
	 * 1. Changes storage adapter data/state.
	 * 1. Adapters with support will create a local transaction.
	 *
	 * @param modelOrConstructor The model or model instance to delete.
	 * @param condition The conditions under which the delete should succeed.
	 * Omit to attempt to delete unconditionally. An unconditional delete
	 * @returns A tuple of the model(s) attempted for deletion and the model(s)
	 * actually deleted.
	 */
	delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>
	): Promise<[T[], T[]]>;

	/**
	 * Returns an array of models instances for the given model from the adapter
	 * matching the given predicate/conditions. Applies pagination if provided.
	 * If no predicate is given, returns all models.
	 *
	 * SIDE EFFECT:
	 * 1. Adapters with support will create a local transaction.
	 *
	 * @param modelConstructor The model type to fetch.
	 * @param predicate The conditions to filter by.
	 * @param pagination The page start/size.
	 * @returns Array of model instances.
	 */
	query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]>;

	/**
	 * Fetches the first or last item as specified from a table sorted
	 * by ID.
	 *
	 * SIDE EFFECT:
	 * 1. Adapters with support will create a local transaction.
	 *
	 * @param modelConstructor The model type to look for.
	 * @param firstOrLast Whether to grab the first or last item in PK order.
	 * @returns A single model instance or `undefined`
	 */
	queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne
	): Promise<T | undefined>;

	/**
	 * Save an array of items to the table indicated by the given model type.
	 *
	 * SIDE EFFECT:
	 * 1. Adapters with support will create a local transaction.
	 *
	 * @param modelConstructor Model type to save.
	 * @param items Array of items to save.
	 * @returns Array of tuples like [SavedItem, SaveOperation][]
	 */
	batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]>;
}
