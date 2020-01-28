import { Adapter } from '.';
import { ModelInstanceCreator } from '../../datastore/datastore';
import {
	InternalSchema,
	ModelPredicate,
	NamespaceResolver,
	OpType,
	PersistentModel,
	PersistentModelConstructor,
	QueryOne,
	PaginationInput,
} from '../../types';
declare class IndexedDBAdapter implements Adapter {
	private schema;
	private namespaceResolver;
	private modelInstanceCreator;
	private getModelConstructorByModelName;
	private db;
	private initPromise;
	private resolve;
	private reject;
	private checkPrivate;
	private getStorenameForModel;
	private getStorename;
	setUp(
		theSchema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: string,
			modelName: string
		) => PersistentModelConstructor<any>
	): Promise<void>;
	save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]>;
	private load;
	query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput
	): Promise<T[]>;
	private inMemoryPagination;
	private enginePagination;
	queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast?: QueryOne
	): Promise<T | undefined>;
	delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>
	): Promise<[T[], T[]]>;
	private deleteItem;
	private deleteTraverse;
	clear(): Promise<void>;
}
declare const _default: IndexedDBAdapter;
export default _default;
