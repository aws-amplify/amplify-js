import { ModelInstanceCreator } from './datastore/datastore';
import {
	isAWSDate,
	isAWSTime,
	isAWSDateTime,
	isAWSTimestamp,
	isAWSEmail,
	isAWSJSON,
	isAWSURL,
	isAWSPhone,
	isAWSIPAddress,
	NAMESPACES,
	extractPrimaryKeyFieldNames,
} from './util';
import { PredicateAll } from './predicates';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { Auth } from '@aws-amplify/auth';
import { API } from '@aws-amplify/api';
import { Cache } from '@aws-amplify/cache';
import { Adapter } from './storage/adapter';

export type Scalar<T> = T extends Array<infer InnerType> ? InnerType : T;

//#region Schema types
export type Schema = UserSchema & {
	version: string;
	codegenVersion: string;
};
export type UserSchema = {
	models: SchemaModels;
	nonModels?: SchemaNonModels;
	relationships?: RelationshipType;
	keys?: ModelKeys;
	enums: SchemaEnums;
	modelTopologicalOrdering?: Map<string, string[]>;
};
export type InternalSchema = {
	namespaces: SchemaNamespaces;
	version: string;
	codegenVersion: string;
};
export type SchemaNamespaces = Record<string, SchemaNamespace>;
export type SchemaNamespace = UserSchema & {
	name: string;
};
export type SchemaModels = Record<string, SchemaModel>;
export type SchemaModel = {
	name: string;
	pluralName: string;
	attributes?: ModelAttributes;

	/**
	 * Explicitly defined fields.
	 */
	fields: ModelFields;

	/**
	 * Explicitly defined fields plus implied fields. (E.g., foreign keys.)
	 */
	allFields?: ModelFields;

	syncable?: boolean;
};

export function isSchemaModel(obj: any): obj is SchemaModel {
	return obj && (<SchemaModel>obj).pluralName !== undefined;
}

export function isSchemaModelWithAttributes(
	m: SchemaModel | SchemaNonModel
): m is SchemaModel {
	return isSchemaModel(m) && (m as SchemaModel).attributes !== undefined;
}

export type SchemaNonModels = Record<string, SchemaNonModel>;
export type SchemaNonModel = {
	name: string;
	fields: ModelFields;
};
type SchemaEnums = Record<string, SchemaEnum>;
type SchemaEnum = {
	name: string;
	values: string[];
};
export type ModelMeta<T extends PersistentModel> = {
	builder: PersistentModelConstructor<T>;
	schema: SchemaModel;
	pkField: string[];
};
export type ModelAssociation = AssociatedWith | TargetNameAssociation;
type AssociatedWith = {
	connectionType: 'HAS_MANY' | 'HAS_ONE';
	associatedWith: string | string[];
	targetName?: string;
	targetNames?: string[];
};

export function isAssociatedWith(obj: any): obj is AssociatedWith {
	return obj && obj.associatedWith;
}

type TargetNameAssociation = {
	connectionType: 'BELONGS_TO';
	targetName?: string;
	targetNames?: string[];
};

export function isTargetNameAssociation(
	obj: any
): obj is TargetNameAssociation {
	return obj?.targetName || obj?.targetNames;
}

type FieldAssociation = {
	connectionType: 'HAS_ONE' | 'BELONGS_TO' | 'HAS_MANY';
};
export function isFieldAssociation(
	obj: any,
	fieldName: string
): obj is FieldAssociation {
	return obj?.fields[fieldName]?.association?.connectionType;
}

export type ModelAttributes = ModelAttribute[];
export type ModelAttribute = { type: string; properties?: Record<string, any> };

export type ModelAuthRule = {
	allow: string;
	provider?: string;
	operations?: string[];
	ownerField?: string;
	identityClaim?: string;
	groups?: string[];
	groupClaim?: string;
	groupsField?: string;
};

export type ModelAttributeAuth = {
	type: 'auth';
	properties: {
		rules: ModelAuthRule[];
	};
};

export function isModelAttributeAuth(
	attr: ModelAttribute
): attr is ModelAttributeAuth {
	return (
		attr.type === 'auth' &&
		attr.properties &&
		attr.properties.rules &&
		attr.properties.rules.length > 0
	);
}

type ModelAttributeKey = {
	type: 'key';
	properties: {
		name?: string;
		fields: string[];
	};
};

type ModelAttributePrimaryKey = {
	type: 'key';
	properties: {
		name: never;
		fields: string[];
	};
};

type ModelAttributeCompositeKey = {
	type: 'key';
	properties: {
		name: string;
		fields: [string, string, string, string?, string?];
	};
};

export function isModelAttributeKey(
	attr: ModelAttribute
): attr is ModelAttributeKey {
	return (
		attr.type === 'key' &&
		attr.properties &&
		attr.properties.fields &&
		attr.properties.fields.length > 0
	);
}

export function isModelAttributePrimaryKey(
	attr: ModelAttribute
): attr is ModelAttributePrimaryKey {
	return isModelAttributeKey(attr) && attr.properties.name === undefined;
}

export function isModelAttributeCompositeKey(
	attr: ModelAttribute
): attr is ModelAttributeCompositeKey {
	return (
		isModelAttributeKey(attr) &&
		attr.properties.name !== undefined &&
		attr.properties.fields.length > 2
	);
}

export type ModelAttributeAuthProperty = {
	allow: ModelAttributeAuthAllow;
	identityClaim?: string;
	groupClaim?: string;
	groups?: string[];
	operations?: string[];
	ownerField?: string;
	provider?: ModelAttributeAuthProvider;
};

export enum ModelAttributeAuthAllow {
	CUSTOM = 'custom',
	OWNER = 'owner',
	GROUPS = 'groups',
	PRIVATE = 'private',
	PUBLIC = 'public',
}

export enum ModelAttributeAuthProvider {
	FUNCTION = 'function',
	USER_POOLS = 'userPools',
	OIDC = 'oidc',
	IAM = 'iam',
	API_KEY = 'apiKey',
}

export type ModelFields = Record<string, ModelField>;
export enum GraphQLScalarType {
	ID,
	String,
	Int,
	Float,
	Boolean,
	AWSDate,
	AWSTime,
	AWSDateTime,
	AWSTimestamp,
	AWSEmail,
	AWSJSON,
	AWSURL,
	AWSPhone,
	AWSIPAddress,
}

export namespace GraphQLScalarType {
	export function getJSType(
		scalar: keyof Omit<
			typeof GraphQLScalarType,
			'getJSType' | 'getValidationFunction'
		>
	) {
		switch (scalar) {
			case 'Boolean':
				return 'boolean';
			case 'ID':
			case 'String':
			case 'AWSDate':
			case 'AWSTime':
			case 'AWSDateTime':
			case 'AWSEmail':
			case 'AWSURL':
			case 'AWSPhone':
			case 'AWSIPAddress':
				return 'string';
			case 'Int':
			case 'Float':
			case 'AWSTimestamp':
				return 'number';
			case 'AWSJSON':
				return 'object';
			default:
				throw new Error('Invalid scalar type');
		}
	}

	export function getValidationFunction(
		scalar: keyof Omit<
			typeof GraphQLScalarType,
			'getJSType' | 'getValidationFunction'
		>
	): ((val: string) => boolean) | ((val: number) => boolean) | undefined {
		switch (scalar) {
			case 'AWSDate':
				return isAWSDate;
			case 'AWSTime':
				return isAWSTime;
			case 'AWSDateTime':
				return isAWSDateTime;
			case 'AWSTimestamp':
				return isAWSTimestamp;
			case 'AWSEmail':
				return isAWSEmail;
			case 'AWSJSON':
				return isAWSJSON;
			case 'AWSURL':
				return isAWSURL;
			case 'AWSPhone':
				return isAWSPhone;
			case 'AWSIPAddress':
				return isAWSIPAddress;
			default:
				return undefined;
		}
	}
}

export type AuthorizationRule = {
	identityClaim: string;
	ownerField: string;
	provider: 'userPools' | 'oidc' | 'iam' | 'apiKey';
	groupClaim: string;
	groups: [string];
	authStrategy: 'owner' | 'groups' | 'private' | 'public';
	areSubscriptionsPublic: boolean;
};

export function isGraphQLScalarType(
	obj: any
): obj is keyof Omit<
	typeof GraphQLScalarType,
	'getJSType' | 'getValidationFunction'
> {
	return obj && GraphQLScalarType[obj] !== undefined;
}

export type ModelFieldType = {
	model: string;
	modelConstructor?: ModelMeta<PersistentModel>;
};
export function isModelFieldType<T extends PersistentModel>(
	obj: any
): obj is ModelFieldType {
	const modelField: keyof ModelFieldType = 'model';
	if (obj && obj[modelField]) return true;

	return false;
}

export type NonModelFieldType = { nonModel: string };
export function isNonModelFieldType(obj: any): obj is NonModelFieldType {
	const typeField: keyof NonModelFieldType = 'nonModel';
	if (obj && obj[typeField]) return true;

	return false;
}

type EnumFieldType = { enum: string };
export function isEnumFieldType(obj: any): obj is EnumFieldType {
	const modelField: keyof EnumFieldType = 'enum';
	if (obj && obj[modelField]) return true;

	return false;
}

export type ModelField = {
	name: string;
	type:
		| keyof Omit<
				typeof GraphQLScalarType,
				'getJSType' | 'getValidationFunction'
		  >
		| ModelFieldType
		| NonModelFieldType
		| EnumFieldType;
	isArray: boolean;
	isRequired?: boolean;
	isReadOnly?: boolean;
	isArrayNullable?: boolean;
	association?: ModelAssociation;
	attributes?: ModelAttributes[];
};
//#endregion

//#region Model definition
export type NonModelTypeConstructor<T> = {
	new (init: T): T;
};

// Class for model
export type PersistentModelConstructor<T extends PersistentModel> = {
	new (init: ModelInit<T, PersistentModelMetaData<T>>): T;
	copyOf(
		src: T,
		mutator: (draft: MutableModel<T, PersistentModelMetaData<T>>) => void
	): T;
};

/**
 * @private
 * Internal use of Amplify only.
 *
 * Indicates to use lazy models or eager models.
 */
export declare class LazyLoadingDisabled {
	disabled: true;
}

/**
 * @private
 * Internal use of Amplify only.
 *
 * Indicates to use lazy models or eager models.
 */
export declare class LazyLoading {}

export type TypeConstructorMap = Record<
	string,
	PersistentModelConstructor<any> | NonModelTypeConstructor<unknown>
>;

/**
 * Each identifier type is represented using nominal types, see:
 * https://basarat.gitbook.io/typescript/main-1/nominaltyping
 */
export declare const __identifierBrand__: unique symbol;
export type IdentifierBrand<T, K> = T & { [__identifierBrand__]: K };

// datastore generates a uuid for you
export type ManagedIdentifier<T, F extends keyof T> = IdentifierBrand<
	{ field: F extends string ? F : never; type: T },
	'ManagedIdentifier'
>;

// you can provide a value, if not, datastore generates a uuid for you
export type OptionallyManagedIdentifier<T, F extends keyof T> = IdentifierBrand<
	{ field: F extends string ? F : never; type: T },
	'OptionallyManagedIdentifier'
>;

// You provide the values
export type CompositeIdentifier<T, K extends Array<keyof T>> = IdentifierBrand<
	{ fields: K; type: T },
	'CompositeIdentifier'
>;

// You provide the value
export type CustomIdentifier<T, K extends keyof T> = CompositeIdentifier<
	T,
	[K]
>;

export type Identifier<T> =
	| ManagedIdentifier<T, any>
	| OptionallyManagedIdentifier<T, any>
	| CompositeIdentifier<T, any>
	| CustomIdentifier<T, any>;

export type IdentifierFields<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T> = never
> = (MetadataOrDefault<T, M>['identifier'] extends
	| ManagedIdentifier<any, any>
	| OptionallyManagedIdentifier<any, any>
	? MetadataOrDefault<T, M>['identifier']['field']
	: MetadataOrDefault<T, M>['identifier'] extends CompositeIdentifier<
			T,
			infer B
	  >
	? B[number] // B[number]
	: MetadataOrDefault<T, M>['identifier']['field']) &
	string;

export type IdentifierFieldsForInit<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T>
> = MetadataOrDefault<T, M>['identifier'] extends
	| DefaultPersistentModelMetaData
	| ManagedIdentifier<T, any>
	? never
	: MetadataOrDefault<T, M>['identifier'] extends OptionallyManagedIdentifier<
			T,
			any
	  >
	? IdentifierFields<T, M>
	: MetadataOrDefault<T, M>['identifier'] extends CompositeIdentifier<T, any>
	? IdentifierFields<T, M>
	: never;

// Instance of model
export declare const __modelMeta__: unique symbol;

export type PersistentModelMetaData<T> = {
	identifier?: Identifier<T>;
	readOnlyFields?: string;
};

export interface AsyncCollection<T> extends AsyncIterable<T> {
	toArray(options?: { max?: number }): Promise<T[]>;
}

export type SettableFieldType<T> = T extends Promise<infer InnerPromiseType>
	? undefined extends InnerPromiseType
		? InnerPromiseType | null
		: InnerPromiseType
	: T extends AsyncCollection<infer InnerCollectionType>
	? InnerCollectionType[] | undefined
	: undefined extends T
	? T | null
	: T;

export type PredicateFieldType<T> = NonNullable<
	Scalar<
		T extends Promise<infer InnerPromiseType>
			? InnerPromiseType
			: T extends AsyncCollection<infer InnerCollectionType>
			? InnerCollectionType
			: T
	>
>;

type KeysOfType<T, FilterType> = {
	[P in keyof T]: T[P] extends FilterType ? P : never;
}[keyof T];

type KeysOfSuperType<T, FilterType> = {
	[P in keyof T]: FilterType extends T[P] ? P : never;
}[keyof T];

type OptionalRelativesOf<T> =
	| KeysOfType<T, AsyncCollection<any>>
	| KeysOfSuperType<T, Promise<undefined>>;

type OmitOptionalRelatives<T> = Omit<T, OptionalRelativesOf<T>>;
type PickOptionalRelatives<T> = Pick<T, OptionalRelativesOf<T>>;
type OmitOptionalFields<T> = Omit<
	T,
	KeysOfSuperType<T, undefined> | OptionalRelativesOf<T>
>;
type PickOptionalFields<T> = Pick<
	T,
	KeysOfSuperType<T, undefined> | OptionalRelativesOf<T>
>;

export type DefaultPersistentModelMetaData = {
	identifier: ManagedIdentifier<{ id: string }, 'id'>;
	readOnlyFields: never;
};

export type MetadataOrDefault<
	T extends PersistentModel,
	_ extends PersistentModelMetaData<T> = never
> = T extends {
	[__modelMeta__]: PersistentModelMetaData<T>;
}
	? T[typeof __modelMeta__]
	: DefaultPersistentModelMetaData;

export type PersistentModel = Readonly<Record<string, any>>;

export type MetadataReadOnlyFields<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T>
> = Extract<
	MetadataOrDefault<T, M>['readOnlyFields'] | M['readOnlyFields'],
	keyof T
>;

// This type omits the metadata field in the constructor init object
// This type omits identifier fields in the constructor init object
// This type omits readOnlyFields in the constructor init object
// This type requires some identifiers in the constructor init object (e.g. CustomIdentifier)
// This type makes optional some identifiers in the constructor init object (e.g. OptionallyManagedIdentifier)
export type ModelInitBase<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T> = {}
> = Omit<
	T,
	typeof __modelMeta__ | IdentifierFields<T, M> | MetadataReadOnlyFields<T, M>
> &
	(MetadataOrDefault<T, M>['identifier'] extends OptionallyManagedIdentifier<
		T,
		any
	>
		? Partial<Pick<T, IdentifierFieldsForInit<T, M>>>
		: Required<Pick<T, IdentifierFieldsForInit<T, M>>>);

export type ModelInit<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T> = {}
> = {
	[P in keyof OmitOptionalRelatives<ModelInitBase<T, M>>]: SettableFieldType<
		ModelInitBase<T, M>[P]
	>;
} & {
	[P in keyof PickOptionalRelatives<ModelInitBase<T, M>>]+?: SettableFieldType<
		ModelInitBase<T, M>[P]
	>;
};

type DeepWritable<T> = {
	-readonly [P in keyof T]: T[P] extends TypeName<T[P]>
		? T[P]
		: T[P] extends Promise<infer InnerPromiseType>
		? InnerPromiseType
		: T[P] extends AsyncCollection<infer InnerCollectionType>
		? InnerCollectionType[] | undefined
		: DeepWritable<T[P]>;
};

export type MutableModel<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T> = {}
	// This provides Intellisense with ALL of the properties, regardless of read-only
	// but will throw a linting error if trying to overwrite a read-only property
> = DeepWritable<
	Omit<T, IdentifierFields<T, M> | MetadataReadOnlyFields<T, M>>
> &
	Readonly<Pick<T, IdentifierFields<T, M> | MetadataReadOnlyFields<T, M>>>;

export type ModelInstanceMetadata = {
	_version: number;
	_lastChangedAt: number;
	_deleted: boolean;
};

export type IdentifierFieldValue<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T>
> = MetadataOrDefault<T, M>['identifier'] extends CompositeIdentifier<T, any>
	? MetadataOrDefault<T, M>['identifier']['fields'] extends [any]
		? T[MetadataOrDefault<T, M>['identifier']['fields'][0]]
		: never
	: T[MetadataOrDefault<T, M>['identifier']['field']];

export type IdentifierFieldOrIdentifierObject<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T>
> = Pick<T, IdentifierFields<T, M>> | IdentifierFieldValue<T, M>;

export function isIdentifierObject<T extends PersistentModel>(
	obj: any,
	modelDefinition: SchemaModel
): obj is IdentifierFields<T extends PersistentModel ? T : never, any> {
	const keys = extractPrimaryKeyFieldNames(modelDefinition);

	return (
		typeof obj === 'object' && obj && keys.every(k => obj[k] !== undefined)
	);
}
//#endregion

//#region Subscription messages
export enum OpType {
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}

export type SubscriptionMessage<T extends PersistentModel> = Pick<
	InternalSubscriptionMessage<T>,
	'opType' | 'element' | 'model' | 'condition'
>;

export type InternalSubscriptionMessage<T extends PersistentModel> = {
	opType: OpType;
	element: T;
	model: PersistentModelConstructor<T>;
	condition: PredicatesGroup<T> | null;
	savedElement?: T;
};

export type DataStoreSnapshot<T extends PersistentModel> = {
	items: T[];
	isSynced: boolean;
};
//#endregion

//#region Predicates

export type PredicateExpression<
	M extends PersistentModel,
	FT
> = TypeName<FT> extends keyof MapTypeToOperands<FT>
	? (
			operator: keyof MapTypeToOperands<FT>[TypeName<FT>],
			// make the operand type match the type they're trying to filter on
			operand: MapTypeToOperands<FT>[TypeName<FT>][keyof MapTypeToOperands<FT>[TypeName<FT>]]
	  ) => ModelPredicate<M>
	: never;

type EqualityOperators<T> = {
	ne: T;
	eq: T;
};
type ScalarNumberOperators<T> = EqualityOperators<T> & {
	le: T;
	lt: T;
	ge: T;
	gt: T;
};
type NumberOperators<T> = ScalarNumberOperators<T> & {
	between: [T, T];
};
type StringOperators<T> = ScalarNumberOperators<T> & {
	beginsWith: T;
	contains: T;
	notContains: T;
};
type BooleanOperators<T> = EqualityOperators<T>;
type ArrayOperators<T> = {
	contains: T;
	notContains: T;
};
export type AllOperators = NumberOperators<any> &
	StringOperators<any> &
	ArrayOperators<any>;

type MapTypeToOperands<T> = {
	number: NumberOperators<NonNullable<T>>;
	string: StringOperators<NonNullable<T>>;
	boolean: BooleanOperators<NonNullable<T>>;
	'number[]': ArrayOperators<number>;
	'string[]': ArrayOperators<string>;
	'boolean[]': ArrayOperators<boolean>;
};

type TypeName<T> = T extends string
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

export type PredicateGroups<T extends PersistentModel> = {
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

export type ModelPredicate<M extends PersistentModel> = {
	[K in keyof M]-?: PredicateExpression<M, NonNullable<M[K]>>;
} & PredicateGroups<M>;

export type ProducerModelPredicate<M extends PersistentModel> = (
	condition: ModelPredicate<M>
) => ModelPredicate<M>;

export type PredicatesGroup<T extends PersistentModel> = {
	type: keyof PredicateGroups<T>;
	predicates: (PredicateObject<T> | PredicatesGroup<T>)[];
};

export function isPredicateObj<T extends PersistentModel>(
	obj: any
): obj is PredicateObject<T> {
	return obj && (<PredicateObject<T>>obj).field !== undefined;
}

export function isPredicateGroup<T extends PersistentModel>(
	obj: any
): obj is PredicatesGroup<T> {
	return obj && (<PredicatesGroup<T>>obj).type !== undefined;
}

export type PredicateObject<T extends PersistentModel> = {
	field: keyof T;
	operator: keyof AllOperators;
	operand: any;
};

export enum QueryOne {
	FIRST,
	LAST,
}
export type GraphQLField = {
	[field: string]: {
		[operator: string]: string | number | [number, number];
	};
};

export type GraphQLCondition = Partial<
	| GraphQLField
	| {
			and: [GraphQLCondition];
			or: [GraphQLCondition];
			not: GraphQLCondition;
	  }
>;

export type GraphQLFilter = Partial<
	| GraphQLField
	| {
			and: GraphQLFilter[];
	  }
	| {
			or: GraphQLFilter[];
	  }
	| {
			not: GraphQLFilter;
	  }
>;

//#endregion

//#region Pagination

export type ProducerPaginationInput<T extends PersistentModel> = {
	sort?: ProducerSortPredicate<T>;
	limit?: number;
	page?: number;
};

export type ObserveQueryOptions<T extends PersistentModel> = Pick<
	ProducerPaginationInput<T>,
	'sort'
>;

export type PaginationInput<T extends PersistentModel> = {
	sort?: SortPredicate<T>;
	limit?: number;
	page?: number;
};

export type ProducerSortPredicate<M extends PersistentModel> = (
	condition: SortPredicate<M>
) => SortPredicate<M>;

export type SortPredicate<T extends PersistentModel> = {
	[K in keyof T]-?: SortPredicateExpression<T, NonNullable<T[K]>>;
};

export type SortPredicateExpression<
	M extends PersistentModel,
	FT
> = TypeName<FT> extends keyof MapTypeToOperands<FT>
	? (sortDirection: keyof typeof SortDirection) => SortPredicate<M>
	: never;

export enum SortDirection {
	ASCENDING = 'ASCENDING',
	DESCENDING = 'DESCENDING',
}

export type SortPredicatesGroup<T extends PersistentModel> =
	SortPredicateObject<T>[];

export type SortPredicateObject<T extends PersistentModel> = {
	field: keyof T;
	sortDirection: keyof typeof SortDirection;
};

//#endregion

//#region System Components

export type SystemComponent = {
	setUp(
		schema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: NAMESPACES,
			modelName: string
		) => PersistentModelConstructor<any>,
		appId?: string
	): Promise<void>;
};

export type NamespaceResolver = (
	modelConstructor: PersistentModelConstructor<any>
) => string;

export type ControlMessageType<T> = {
	type: T;
	data?: any;
};

//#endregion

//#region Relationship types
export type RelationType = {
	fieldName: string;
	modelName: string;
	relationType: 'HAS_ONE' | 'HAS_MANY' | 'BELONGS_TO';
	targetName?: string;
	targetNames?: string[];
	associatedWith?: string | string[];
};

type IndexOptions = {
	unique?: boolean;
};

export type IndexesType = Array<[string, string[], IndexOptions?]>;

export type RelationshipType = {
	[modelName: string]: {
		indexes: IndexesType;
		relationTypes: RelationType[];
	};
};

//#endregion

//#region Key type
export type KeyType = {
	primaryKey?: string[];
	compositeKeys?: Set<string>[];
};

export type ModelKeys = {
	[modelName: string]: KeyType;
};

//#endregion

//#region DataStore config types
export type DataStoreConfig = {
	DataStore?: {
		authModeStrategyType?: AuthModeStrategyType;
		conflictHandler?: ConflictHandler; // default : retry until client wins up to x times
		errorHandler?: (error: SyncError<PersistentModel>) => void; // default : logger.warn
		maxRecordsToSync?: number; // merge
		syncPageSize?: number;
		fullSyncInterval?: number;
		syncExpressions?: SyncExpression[];
		authProviders?: AuthProviders;
		storageAdapter?: Adapter;
	};
	authModeStrategyType?: AuthModeStrategyType;
	conflictHandler?: ConflictHandler; // default : retry until client wins up to x times
	errorHandler?: (error: SyncError<PersistentModel>) => void; // default : logger.warn
	maxRecordsToSync?: number; // merge
	syncPageSize?: number;
	fullSyncInterval?: number;
	syncExpressions?: SyncExpression[];
	authProviders?: AuthProviders;
	storageAdapter?: Adapter;
};

export type AuthProviders = {
	functionAuthProvider: () => { token: string } | Promise<{ token: string }>;
};

export enum AuthModeStrategyType {
	DEFAULT = 'DEFAULT',
	MULTI_AUTH = 'MULTI_AUTH',
}

export type AuthModeStrategyReturn =
	| GRAPHQL_AUTH_MODE
	| GRAPHQL_AUTH_MODE[]
	| undefined
	| null;

export type AuthModeStrategyParams = {
	schema: InternalSchema;
	modelName: string;
	operation: ModelOperation;
};

export type AuthModeStrategy = (
	authModeStrategyParams: AuthModeStrategyParams
) => AuthModeStrategyReturn | Promise<AuthModeStrategyReturn>;

export enum ModelOperation {
	CREATE = 'CREATE',
	READ = 'READ',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}

export type ModelAuthModes = Record<
	string,
	{
		[Property in ModelOperation]: GRAPHQL_AUTH_MODE[];
	}
>;

export type SyncExpression = Promise<{
	modelConstructor: any;
	conditionProducer: (c?: any) => any;
}>;

/*
Adds Intellisense when passing a function | promise that returns a predicate
Or just a predicate. E.g.,

syncExpressions: [
	syncExpression(Post, c => c.rating('gt', 5)),

	OR

	syncExpression(Post, async () => {
		return c => c.rating('gt', 5)
	}),
]
*/

type Option0 = [];
type Option1<T extends PersistentModel> = [V5ModelPredicate<T> | undefined];
type Option<T extends PersistentModel> = Option0 | Option1<T>;

type Lookup<T extends PersistentModel> = {
	0:
		| ModelPredicateExtender<T>
		| Promise<ModelPredicateExtender<T>>
		| typeof PredicateAll
		| Promise<typeof PredicateAll | symbol>;
	1: PredicateInternalsKey | undefined;
};

type ConditionProducer<T extends PersistentModel, A extends Option<T>> = (
	...args: A
) => A['length'] extends keyof Lookup<T> ? Lookup<T>[A['length']] : never;

export async function syncExpression<
	T extends PersistentModel,
	A extends Option<T>
>(
	modelConstructor: PersistentModelConstructor<T>,
	conditionProducer: ConditionProducer<T, A>
): Promise<{
	modelConstructor: PersistentModelConstructor<T>;
	conditionProducer: ConditionProducer<T, A>;
}> {
	return {
		modelConstructor,
		conditionProducer,
	};
}

export type SyncConflict = {
	modelConstructor: PersistentModelConstructor<any>;
	localModel: PersistentModel;
	remoteModel: PersistentModel;
	operation: OpType;
	attempts: number;
};

export type SyncError<T extends PersistentModel> = {
	message: string;
	errorType: ErrorType;
	errorInfo?: string;
	recoverySuggestion?: string;
	model?: string;
	localModel: T;
	remoteModel: T;
	process: ProcessName;
	operation: string;
	cause?: Error;
};

export type ErrorType =
	| 'ConfigError'
	| 'BadModel'
	| 'BadRecord'
	| 'Unauthorized'
	| 'Transient'
	| 'Unknown';

export enum ProcessName {
	'sync' = 'sync',
	'mutate' = 'mutate',
	'subscribe' = 'subscribe',
}

export const DISCARD = Symbol('DISCARD');

export type ConflictHandler = (
	conflict: SyncConflict
) =>
	| Promise<PersistentModel | typeof DISCARD>
	| PersistentModel
	| typeof DISCARD;
export type ErrorHandler = (error: SyncError<PersistentModel>) => void;

export type DeferredCallbackResolverOptions = {
	callback: () => void;
	maxInterval?: number;
	errorHandler?: (error: string) => void;
};

export enum LimitTimerRaceResolvedValues {
	LIMIT = 'LIMIT',
	TIMER = 'TIMER',
}
//#endregion

export type AmplifyContext = {
	Auth: typeof Auth;
	API: typeof API;
	Cache: typeof Cache;
};

// #region V5 predicate types

export type MatchableTypes =
	| string
	| string[]
	| number
	| number[]
	| boolean
	| boolean[];

export type AllFieldOperators = keyof AllOperators;

export type NonNeverKeys<T> = {
	[K in keyof T]: T[K] extends never ? never : K;
}[keyof T];

export type WithoutNevers<T> = Pick<T, NonNeverKeys<T>>;

/**
 * A function that accepts a RecursiveModelPrecicate<T>, which it must use to
 * return a final condition.
 *
 * This is used in `DataStore.query()`, `DataStore.observe()`, and
 * `DataStore.observeQuery()` as the second argument. E.g.,
 *
 * ```
 * DataStore.query(MyModel, model => model.field.eq('some value'))
 * ```
 *
 * More complex queries should also be supported. E.g.,
 *
 * ```
 * DataStore.query(MyModel, model => model.and(m => [
 *   m.relatedEntity.or(relative => [
 *     relative.relativeField.eq('whatever'),
 *     relative.relativeField.eq('whatever else')
 *   ]),
 *   m.myModelField.ne('something')
 * ]))
 * ```
 */
export type RecursiveModelPredicateExtender<RT extends PersistentModel> = (
	lambda: RecursiveModelPredicate<RT>
) => PredicateInternalsKey;

export type RecursiveModelPredicateAggregateExtender<
	RT extends PersistentModel
> = (lambda: RecursiveModelPredicate<RT>) => PredicateInternalsKey[];

export type RecursiveModelPredicateOperator<RT extends PersistentModel> = (
	predicates: RecursiveModelPredicateAggregateExtender<RT>
) => PredicateInternalsKey;

export type RecursiveModelPredicateNegation<RT extends PersistentModel> = (
	predicate: RecursiveModelPredicateExtender<RT>
) => PredicateInternalsKey;

export type RecursiveModelPredicate<RT extends PersistentModel> = {
	[K in keyof RT]-?: PredicateFieldType<RT[K]> extends PersistentModel
		? RecursiveModelPredicate<PredicateFieldType<RT[K]>>
		: ValuePredicate<RT, RT[K]>;
} & {
	or: RecursiveModelPredicateOperator<RT>;
	and: RecursiveModelPredicateOperator<RT>;
	not: RecursiveModelPredicateNegation<RT>;
} & PredicateInternalsKey;

/**
 * A function that accepts a ModelPrecicate<T>, which it must use to return a
 * final condition.
 *
 * This is used as predicates in `DataStore.save()`, `DataStore.delete()`, and
 * DataStore sync expressions.
 *
 * ```
 * DataStore.save(record, model => model.field.eq('some value'))
 * ```
 *
 * Logical operators are supported. But, condtiions are related records are
 * NOT supported. E.g.,
 *
 * ```
 * DataStore.delete(record, model => model.or(m => [
 * 	m.field.eq('whatever'),
 * 	m.field.eq('whatever else')
 * ]))
 * ```
 */
export type ModelPredicateExtender<RT extends PersistentModel> = (
	lambda: V5ModelPredicate<RT>
) => PredicateInternalsKey;

export type ModelPredicateAggregateExtender<RT extends PersistentModel> = (
	lambda: V5ModelPredicate<RT>
) => PredicateInternalsKey[];

export type ValuePredicate<
	RT extends PersistentModel,
	MT extends MatchableTypes
> = {
	[K in AllFieldOperators]: K extends 'between'
		? (
				inclusiveLowerBound: Scalar<MT>,
				inclusiveUpperBound: Scalar<MT>
		  ) => PredicateInternalsKey
		: (operand: Scalar<MT>) => PredicateInternalsKey;
};

export type V5ModelPredicate<RT extends PersistentModel> = WithoutNevers<{
	[K in keyof RT]-?: PredicateFieldType<RT[K]> extends PersistentModel
		? never
		: ValuePredicate<RT, RT[K]>;
}> & {
	or: ModelPredicateOperator<RT>;
	and: ModelPredicateOperator<RT>;
	not: ModelPredicateNegation<RT>;
} & PredicateInternalsKey;

export type ModelPredicateOperator<RT extends PersistentModel> = (
	predicates: ModelPredicateAggregateExtender<RT>
) => PredicateInternalsKey;

export type ModelPredicateNegation<RT extends PersistentModel> = (
	predicate: ModelPredicateExtender<RT>
) => PredicateInternalsKey;

/**
 * A pointer used by DataStore internally to lookup predicate details
 * that should not be exposed on public customer interfaces.
 */
export class PredicateInternalsKey {
	private __isPredicateInternalsKeySentinel: boolean = true;
}

// #endregion
