import {
	ModelInstanceMetadata,
	PersistentModelConstructor,
	PredicateObject,
	PredicatesGroup,
	RelationshipType,
	RelationType,
	SchemaNamespace,
} from './types';
export declare const exhaustiveCheck: (
	obj: never,
	throwOnError?: boolean
) => void;
export declare const validatePredicate: <T extends Readonly<
	{
		id: string;
	} & Record<string, any>
>>(
	model: T,
	groupType: 'and' | 'or' | 'not',
	predicatesOrGroups: (PredicateObject<T> | PredicatesGroup<T>)[]
) => any;
export declare const isModelConstructor: <T extends Readonly<
	{
		id: string;
	} & Record<string, any>
>>(
	obj: any
) => obj is PersistentModelConstructor<T>;
export declare const establishRelation: (
	namespace: SchemaNamespace
) => RelationshipType;
export declare const traverseModel: <T extends Readonly<
	{
		id: string;
	} & Record<string, any>
>>(
	srcModelName: string,
	instance: T,
	namespace: SchemaNamespace,
	modelInstanceCreator: <
		T_1 extends Readonly<
			{
				id: string;
			} & Record<string, any>
		> = Readonly<
			{
				id: string;
			} & Record<string, any>
		>
	>(
		modelConstructor: PersistentModelConstructor<T_1>,
		init: Pick<T_1, Exclude<keyof T_1, 'id'>> & Partial<ModelInstanceMetadata>
	) => T_1,
	getModelConstructorByModelName: (
		namsespaceName: string,
		modelName: string
	) => PersistentModelConstructor<any>
) => {
	modelName: string;
	item: T;
	instance: T;
}[];
export declare const getIndex: (rel: RelationType[], src: string) => string;
export declare enum NAMESPACES {
	DATASTORE = 'datastore',
	USER = 'user',
	SYNC = 'sync',
	STORAGE = 'storage',
}
declare const DATASTORE = NAMESPACES.DATASTORE;
declare const USER = NAMESPACES.USER;
declare const SYNC = NAMESPACES.SYNC;
declare const STORAGE = NAMESPACES.STORAGE;
export { USER, SYNC, STORAGE, DATASTORE };
export declare const isPrivateMode: () => Promise<unknown>;
