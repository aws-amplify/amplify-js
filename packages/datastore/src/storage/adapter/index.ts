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

export interface Adapter extends SystemComponent {
	clear(): Promise<void>;
	save<T extends PersistentModel<any>>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]>;
	delete: <T extends PersistentModel<any>>(
		modelOrModelConstructor: T | PersistentModelConstructor<T, any>,
		condition?: ModelPredicate<T>
	) => Promise<[T[], T[]]>;
	query<T extends PersistentModel<any>>(
		modelConstructor: PersistentModelConstructor<T, any>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]>;
	queryOne<T extends PersistentModel<any>>(
		modelConstructor: PersistentModelConstructor<T, any>,
		firstOrLast: QueryOne
	): Promise<T | undefined>;
	batchSave<T extends PersistentModel<any>>(
		modelConstructor: PersistentModelConstructor<any, any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]>;
}
