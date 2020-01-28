import Observable from 'zen-observable-ts';
import { ModelInstanceCreator } from '../datastore/datastore';
import {
	InternalSchema,
	ModelPredicate,
	NamespaceResolver,
	OpType,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	QueryOne,
	SchemaNamespace,
	SubscriptionMessage,
} from '../types';
import { Adapter } from './adapter';
export declare type StorageSubscriptionMessage = SubscriptionMessage<any> & {
	mutator?: Symbol;
};
export declare type StorageFacade = Omit<Adapter, 'setUp'>;
declare class Storage implements StorageFacade {
	private readonly schema;
	private readonly namespaceResolver;
	private readonly getModelConstructorByModelName;
	private readonly modelInstanceCreator;
	private readonly adapter?;
	private initialized;
	private readonly pushStream;
	constructor(
		schema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		getModelConstructorByModelName: (
			namsespaceName: string,
			modelName: string
		) => PersistentModelConstructor<any>,
		modelInstanceCreator: ModelInstanceCreator,
		adapter?: Adapter
	);
	static getNamespace(): SchemaNamespace;
	private init;
	save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]>;
	delete<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]>;
	delete<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]>;
	query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput
	): Promise<T[]>;
	queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast?: QueryOne
	): Promise<T>;
	observe<T extends PersistentModel>(
		modelConstructor?: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		skipOwn?: Symbol
	): Observable<SubscriptionMessage<T>>;
	clear(completeObservable?: boolean): Promise<void>;
}
declare class ExclusiveStorage implements StorageFacade {
	private storage;
	private readonly mutex;
	constructor(
		schema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		getModelConstructorByModelName: (
			namsespaceName: string,
			modelName: string
		) => PersistentModelConstructor<any>,
		modelInstanceCreator: ModelInstanceCreator,
		adapter?: Adapter
	);
	runExclusive<T>(fn: (storage: Storage) => Promise<T>): Promise<T>;
	save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]>;
	delete<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]>;
	delete<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
		mutator?: Symbol
	): Promise<[T[], T[]]>;
	query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput
	): Promise<T[]>;
	queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast?: QueryOne
	): Promise<T>;
	static getNamespace(): SchemaNamespace;
	observe<T extends PersistentModel>(
		modelConstructor?: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		skipOwn?: Symbol
	): Observable<SubscriptionMessage<T>>;
	clear(): Promise<void>;
}
export default ExclusiveStorage;
