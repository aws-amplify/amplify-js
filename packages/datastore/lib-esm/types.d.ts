import { ModelInstanceCreator } from './datastore/datastore';
export declare type Schema = UserSchema & {
	version: string;
};
export declare type UserSchema = {
	models: SchemaModels;
	relationships?: RelationshipType;
	enums: SchemaEnums;
	modelTopologicalOrdering?: Map<string, string[]>;
};
export declare type InternalSchema = {
	namespaces: SchemaNamespaces;
	version: string;
};
export declare type SchemaNamespaces = Record<string, SchemaNamespace>;
export declare type SchemaNamespace = UserSchema & {
	name: string;
};
export declare type SchemaModels = Record<string, SchemaModel>;
export declare type SchemaModel = {
	name: string;
	pluralName: string;
	attributes?: ModelAttributes;
	fields: ModelFields;
	syncable?: boolean;
};
declare type SchemaEnums = Record<string, SchemaEnum>;
declare type SchemaEnum = {
	name: string;
	values: string[];
};
export declare type ModelAssociation = AssociatedWith | TargetNameAssociation;
declare type AssociatedWith = {
	connectionType: 'HAS_MANY' | 'HAS_ONE';
	associatedWith: string;
};
export declare function isAssociatedWith(obj: any): obj is AssociatedWith;
declare type TargetNameAssociation = {
	connectionType: 'BELONGS_TO';
	targetName: string;
};
export declare function isTargetNameAssociation(
	obj: any
): obj is TargetNameAssociation;
declare type ModelAttributes = ModelAttribute[];
declare type ModelAttribute = {
	type: string;
	properties?: Record<string, any>;
};
export declare type ModelFields = Record<string, ModelField>;
export declare enum GraphQLScalarType {
	ID = 0,
	String = 1,
	Int = 2,
	Float = 3,
	Boolean = 4,
	AWSDate = 5,
	AWSTime = 6,
	AWSDateTime = 7,
	AWSTimestamp = 8,
	AWSEmail = 9,
	AWSJSON = 10,
	AWSURL = 11,
	AWSPhone = 12,
	AWSIPAddress = 13,
}
export declare namespace GraphQLScalarType {
	function getJSType(
		scalar: keyof Omit<typeof GraphQLScalarType, 'getJSType'>
	): 'string' | 'number' | 'boolean';
}
export declare type AuthorizationRule = {
	identityClaim: string;
	ownerField: string;
	provider: 'userPools' | 'oidc' | 'iam' | 'apiKey';
	groupClaim: string;
	groups: [string];
	authStrategy: 'owner' | 'group' | 'private' | 'public';
};
export declare function isGraphQLScalarType(
	obj: any
): obj is keyof Omit<typeof GraphQLScalarType, 'getJSType'>;
export declare type ModelFieldType = {
	model: string;
};
export declare function isModelFieldType(obj: any): obj is ModelFieldType;
declare type EnumFieldType = {
	enum: string;
};
export declare function isEnumFieldType(obj: any): obj is EnumFieldType;
declare type ModelField = {
	name: string;
	type:
		| keyof Omit<typeof GraphQLScalarType, 'getJSType'>
		| ModelFieldType
		| EnumFieldType;
	isArray: boolean;
	isRequired?: boolean;
	association?: ModelAssociation;
	attributes?: ModelAttributes[];
};
export declare type PersistentModelConstructor<T extends PersistentModel> = {
	new (init: ModelInit<T>): T;
	copyOf(src: T, mutator: (draft: MutableModel<T>) => T | void): T;
};
export declare type PersistentModel = Readonly<
	{
		id: string;
	} & Record<string, any>
>;
export declare type ModelInit<T> = Omit<T, 'id'>;
export declare type MutableModel<T> = Omit<
	{
		-readonly [P in keyof T]: T[P];
	},
	'id'
>;
export declare type ModelInstanceMetadata = {
	id: string;
	_version: number;
	_lastChangedAt: number;
	_deleted: boolean;
};
export declare enum OpType {
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}
export declare type SubscriptionMessage<T extends PersistentModel> = {
	opType: OpType;
	element: T;
	model: PersistentModelConstructor<T>;
	condition: PredicatesGroup<T> | null;
};
export declare type PredicateExpression<
	M extends PersistentModel,
	FT
> = TypeName<FT> extends keyof MapTypeToOperands<FT>
	? (
			operator: keyof MapTypeToOperands<FT>[TypeName<FT>],
			operand: MapTypeToOperands<FT>[TypeName<FT>][keyof MapTypeToOperands<
				FT
			>[TypeName<FT>]]
	  ) => ModelPredicate<M>
	: never;
declare type EqualityOperators<T> = {
	ne: T;
	eq: T;
};
declare type ScalarNumberOperators<T> = EqualityOperators<T> & {
	le: T;
	lt: T;
	ge: T;
	gt: T;
};
declare type NumberOperators<T> = ScalarNumberOperators<T> & {
	between: [T, T];
};
declare type StringOperators<T> = ScalarNumberOperators<T> & {
	beginsWith: T;
	contains: T;
	notContains: T;
};
declare type BooleanOperators<T> = EqualityOperators<T>;
declare type ArrayOperators<T> = {
	contains: T;
	notContains: T;
};
export declare type AllOperators = NumberOperators<any> &
	StringOperators<any> &
	ArrayOperators<any>;
declare type MapTypeToOperands<T> = {
	number: NumberOperators<NonNullable<T>>;
	string: StringOperators<NonNullable<T>>;
	boolean: BooleanOperators<NonNullable<T>>;
	'number[]': ArrayOperators<number>;
	'string[]': ArrayOperators<string>;
	'boolean[]': ArrayOperators<boolean>;
};
declare type TypeName<T> = T extends string
	? 'string'
	: T extends number
	? 'number'
	: T extends boolean
	? 'boolean'
	: T extends string[]
	? 'string[]'
	: T extends number[]
	? 'number[]'
	: T extends boolean[]
	? 'boolean[]'
	: never;
export declare type PredicateGroups<T extends PersistentModel> = {
	and: (
		predicate: (predicate: ModelPredicate<T>) => ModelPredicate<T>
	) => ModelPredicate<T>;
	or: (
		predicate: (predicate: ModelPredicate<T>) => ModelPredicate<T>
	) => ModelPredicate<T>;
	not: (
		predicate: (predicate: ModelPredicate<T>) => ModelPredicate<T>
	) => ModelPredicate<T>;
};
export declare type ModelPredicate<M extends PersistentModel> = {
	[K in keyof M]-?: PredicateExpression<M, NonNullable<M[K]>>;
} &
	PredicateGroups<M>;
export declare type ProducerModelPredicate<M extends PersistentModel> = (
	condition: ModelPredicate<M>
) => ModelPredicate<M>;
export declare type PredicatesGroup<T extends PersistentModel> = {
	type: keyof PredicateGroups<T>;
	predicates: (PredicateObject<T> | PredicatesGroup<T>)[];
};
export declare function isPredicateObj<T extends PersistentModel>(
	obj: any
): obj is PredicateObject<T>;
export declare function isPredicateGroup<T extends PersistentModel>(
	obj: any
): obj is PredicatesGroup<T>;
export declare type PredicateObject<T extends PersistentModel> = {
	field: keyof T;
	operator: keyof AllOperators;
	operand: any;
};
export declare enum QueryOne {
	FIRST = 0,
	LAST = 1,
}
export declare type GraphQLCondition = Partial<
	| {
			[field: string]: {
				[operator: string]: string | number | [number, number];
			};
	  }
	| {
			and: [GraphQLCondition];
			or: [GraphQLCondition];
			not: GraphQLCondition;
	  }
>;
export declare type PaginationInput = {
	limit?: number;
	page?: number;
};
export declare type SystemComponent = {
	setUp(
		schema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: string,
			modelName: string
		) => PersistentModelConstructor<any>
	): Promise<void>;
};
export declare type NamespaceResolver = (
	modelConstructor: PersistentModelConstructor<any>
) => string;
export declare type RelationType = {
	fieldName: string;
	modelName: string;
	relationType: 'HAS_ONE' | 'HAS_MANY' | 'BELONGS_TO';
	targetName?: string;
};
export declare type RelationshipType = {
	[modelName: string]: {
		indexes: string[];
		relationTypes: RelationType[];
	};
};
export declare type DataStoreConfig = {
	DataStore?: {
		conflictHandler?: ConflictHandler;
		errorHandler?: (error: SyncError) => void;
		maxRecordsToSync?: number;
		fullSyncInterval?: number;
	};
	conflictHandler?: ConflictHandler;
	errorHandler?: (error: SyncError) => void;
	maxRecordsToSync?: number;
	fullSyncInterval?: number;
};
export declare type SyncConflict = {
	modelConstructor: PersistentModelConstructor<any>;
	localModel: PersistentModel;
	remoteModel: PersistentModel;
	operation: OpType;
	attempts: number;
};
export declare type SyncError = {
	message: string;
	errorType: string;
	errorInfo: string;
	localModel: PersistentModel;
	remoteModel: PersistentModel;
	operation: string;
};
export declare const DISCARD: unique symbol;
export declare type ConflictHandler = (
	conflict: SyncConflict
) =>
	| Promise<PersistentModel | typeof DISCARD>
	| PersistentModel
	| typeof DISCARD;
export declare type ErrorHandler = (error: SyncError) => void;
export {};
