// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { InternalAPI } from '@aws-amplify/api/internals';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';

import { ModelInstanceCreator } from './datastore/datastore';
import {
	NAMESPACES,
	extractPrimaryKeyFieldNames,
	isAWSDate,
	isAWSDateTime,
	isAWSEmail,
	isAWSIPAddress,
	isAWSJSON,
	isAWSPhone,
	isAWSTime,
	isAWSTimestamp,
	isAWSURL,
} from './util';
import { PredicateAll } from './predicates';
import { Adapter } from './storage/adapter';

export type Scalar<T> = T extends (infer InnerType)[] ? InnerType : T;

// #region Schema types
/**
 * @deprecated If you intended to use the Schema for `generateClient`, then you've imported the wrong Schema type.
 * Use `import { type Schema } from '../amplify/data/resource' instead. If you intended to import the type for DataStore
 * Schemas, then import "DataStoreSchema" instead.
 */
export type Schema = DataStoreSchema;

export type DataStoreSchema = UserSchema & {
	version: string;
	codegenVersion: string;
};

export interface UserSchema {
	models: SchemaModels;
	nonModels?: SchemaNonModels;
	relationships?: RelationshipType;
	keys?: ModelKeys;
	enums: SchemaEnums;
	modelTopologicalOrdering?: Map<string, string[]>;
}
export interface InternalSchema {
	namespaces: SchemaNamespaces;
	version: string;
	codegenVersion: string;
}
export type SchemaNamespaces = Record<string, SchemaNamespace>;
export type SchemaNamespace = UserSchema & {
	name: string;
};
export type SchemaModels = Record<string, SchemaModel>;
export interface SchemaModel {
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
}

/**
 * @private
 * @param obj
 * @returns `true` if the given object likely represents a model in a schema.
 */
export function isSchemaModel(obj: any): obj is SchemaModel {
	return obj && (obj as SchemaModel).pluralName !== undefined;
}

/**
 * @private
 * @param m
 * @returns `true` if the given schema entry defines Schema Model attributes.
 */
export function isSchemaModelWithAttributes(
	m: SchemaModel | SchemaNonModel,
): m is SchemaModel {
	return isSchemaModel(m) && (m as SchemaModel).attributes !== undefined;
}

export type SchemaNonModels = Record<string, SchemaNonModel>;
export interface SchemaNonModel {
	name: string;
	fields: ModelFields;
}
type SchemaEnums = Record<string, SchemaEnum>;
interface SchemaEnum {
	name: string;
	values: string[];
}
export interface ModelMeta<T extends PersistentModel> {
	builder: PersistentModelConstructor<T>;
	schema: SchemaModel;
	pkField: string[];
}
export type ModelAssociation = AssociatedWith | TargetNameAssociation;
interface AssociatedWith {
	connectionType: 'HAS_MANY' | 'HAS_ONE';
	associatedWith: string | string[];
	targetName?: string;
	targetNames?: string[];
}

/**
 * @private
 * @param obj
 * @returns `true` if the object is an `AssociatedWith` definition.
 */
export function isAssociatedWith(obj: any): obj is AssociatedWith {
	return obj && obj.associatedWith;
}

interface TargetNameAssociation {
	connectionType: 'BELONGS_TO';
	targetName?: string;
	targetNames?: string[];
}

/**
 * @private
 * @param obj
 * @returns `true` if the given object specifies either `targetName` or `targetNames`.
 */
export function isTargetNameAssociation(
	obj: any,
): obj is TargetNameAssociation {
	return obj?.targetName || obj?.targetNames;
}

interface FieldAssociation {
	connectionType: 'HAS_ONE' | 'BELONGS_TO' | 'HAS_MANY';
}

/**
 * @private
 * @param obj
 * @param fieldName
 * @returns Truthy if the object has a `FieldAssociation` for the given `fieldName`.
 */
export function isFieldAssociation(
	obj: any,
	fieldName: string,
): obj is FieldAssociation {
	return obj?.fields[fieldName]?.association?.connectionType;
}

export type ModelAttributes = ModelAttribute[];
export interface ModelAttribute {
	type: string;
	properties?: Record<string, any>;
}

export interface ModelAuthRule {
	allow: string;
	provider?: string;
	operations?: string[];
	ownerField?: string;
	identityClaim?: string;
	groups?: string[];
	groupClaim?: string;
	groupsField?: string;
}

export interface ModelAttributeAuth {
	type: 'auth';
	properties: {
		rules: ModelAuthRule[];
	};
}

/**
 * @private
 * @param attr
 * @returns `true` if the given attribute is an auth attribute with rules.
 */
export function isModelAttributeAuth(
	attr: ModelAttribute,
): attr is ModelAttributeAuth {
	return (
		attr.type === 'auth' &&
		attr.properties &&
		attr.properties.rules &&
		attr.properties.rules.length > 0
	);
}

interface ModelAttributeKey {
	type: 'key';
	properties: {
		name?: string;
		fields: string[];
	};
}

interface ModelAttributePrimaryKey {
	type: 'key';
	properties: {
		name: never;
		fields: string[];
	};
}

interface ModelAttributeCompositeKey {
	type: 'key';
	properties: {
		name: string;
		fields: [string, string, string, string?, string?];
	};
}

/**
 * @private
 * @param attr
 * @returns `true` if the given attribute is a key field.
 */
export function isModelAttributeKey(
	attr: ModelAttribute,
): attr is ModelAttributeKey {
	return (
		attr.type === 'key' &&
		attr.properties &&
		attr.properties.fields &&
		attr.properties.fields.length > 0
	);
}

/**
 * @private
 * @param attr
 * @returns `true` if the given attribute is a primary key, indicated by the key being unnamed.
 */
export function isModelAttributePrimaryKey(
	attr: ModelAttribute,
): attr is ModelAttributePrimaryKey {
	return isModelAttributeKey(attr) && attr.properties.name === undefined;
}

/**
 * @private
 * @param attr
 * @returns `true` if the given attribute represents a composite key with multiple fields.
 */
export function isModelAttributeCompositeKey(
	attr: ModelAttribute,
): attr is ModelAttributeCompositeKey {
	return (
		isModelAttributeKey(attr) &&
		attr.properties.name !== undefined &&
		attr.properties.fields.length > 2
	);
}

export interface ModelAttributeAuthProperty {
	allow: ModelAttributeAuthAllow;
	identityClaim?: string;
	groupClaim?: string;
	groups?: string[];
	operations?: string[];
	ownerField?: string;
	provider?: ModelAttributeAuthProvider;
}

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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GraphQLScalarType {
	export function getJSType(
		scalar: keyof Omit<
			typeof GraphQLScalarType,
			'getJSType' | 'getValidationFunction'
		>,
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
		>,
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

export interface AuthorizationRule {
	identityClaim: string;
	ownerField: string;
	provider: 'userPools' | 'oidc' | 'iam' | 'apiKey';
	groupClaim: string;
	groups: [string];
	groupsField: string;
	authStrategy: 'owner' | 'groups' | 'private' | 'public';
	areSubscriptionsPublic: boolean;
}

/**
 * @private
 * @returns `true` if the given field specifies a scalar type.
 */
export function isGraphQLScalarType(
	obj: any,
): obj is keyof Omit<
	typeof GraphQLScalarType,
	'getJSType' | 'getValidationFunction'
> {
	return obj && GraphQLScalarType[obj] !== undefined;
}

export interface ModelFieldType {
	model: string;
	modelConstructor?: ModelMeta<PersistentModel>;
}

/**
 * @private
 * @param obj
 * @returns `true` if the given field specifies a Model.
 */
export function isModelFieldType<_ extends PersistentModel>(
	obj: any,
): obj is ModelFieldType {
	const modelField: keyof ModelFieldType = 'model';
	if (obj && obj[modelField]) return true;

	return false;
}

export interface NonModelFieldType {
	nonModel: string;
}

/**
 * @private
 * @param obj
 * @returns `true` if the given field specifies a custom non-model type.
 */
export function isNonModelFieldType(obj: any): obj is NonModelFieldType {
	const typeField: keyof NonModelFieldType = 'nonModel';
	if (obj && obj[typeField]) return true;

	return false;
}

interface EnumFieldType {
	enum: string;
}

/**
 * @private
 * @param obj
 * @returns `true` if the object is an `EnumFieldType`.
 */
export function isEnumFieldType(obj: any): obj is EnumFieldType {
	const modelField: keyof EnumFieldType = 'enum';
	if (obj && obj[modelField]) return true;

	return false;
}

export interface ModelField {
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
}
// #endregion

// #region Model definition
export type NonModelTypeConstructor<T> = new (init: T) => T;

// Class for model
export interface PersistentModelConstructor<T extends PersistentModel> {
	new (init: ModelInit<T, PersistentModelMetaData<T>>): T;
	copyOf(
		src: T,
		mutator: (draft: MutableModel<T, PersistentModelMetaData<T>>) => void,
	): T;
}

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

interface GenericIdentifier {
	field: any;
}

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
export type CompositeIdentifier<T, K extends (keyof T)[]> = IdentifierBrand<
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
	M extends PersistentModelMetaData<T> = never,
> = (MetadataOrDefault<T, M>['identifier'] extends
	| ManagedIdentifier<any, any>
	| OptionallyManagedIdentifier<any, any>
	? MetadataOrDefault<T, M>['identifier']['field']
	: MetadataOrDefault<T, M>['identifier'] extends CompositeIdentifier<
				T,
				infer B
		  >
		? B[number] // B[number]
		: MetadataOrDefault<T, M>['identifier'] extends GenericIdentifier
			? MetadataOrDefault<T, M>['identifier']['field']
			: unknown) &
	string;

export type IdentifierFieldsForInit<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T>,
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

export interface PersistentModelMetaData<T> {
	identifier?: Identifier<T>;
	readOnlyFields?: string;
}

export interface AsyncCollection<T> extends AsyncIterable<T> {
	toArray(options?: { max?: number }): Promise<T[]>;
}

export type SettableFieldType<T> =
	T extends Promise<infer InnerPromiseType>
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

export interface DefaultPersistentModelMetaData {
	identifier: ManagedIdentifier<{ id: string }, 'id'>;
	readOnlyFields: never;
}

export type MetadataOrDefault<
	T extends PersistentModel,
	_ extends PersistentModelMetaData<T> = never,
> = T extends {
	[__modelMeta__]: PersistentModelMetaData<T>;
}
	? T[typeof __modelMeta__]
	: DefaultPersistentModelMetaData;

export type PersistentModel = Readonly<Record<string, any>>;

export type MetadataReadOnlyFields<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T>,
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
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	M extends PersistentModelMetaData<T> = {},
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
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	M extends PersistentModelMetaData<T> = {},
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
			? undefined extends InnerPromiseType
				? InnerPromiseType | null
				: InnerPromiseType
			: T[P] extends AsyncCollection<infer InnerCollectionType>
				? InnerCollectionType[] | undefined | null
				: DeepWritable<T[P]>;
};

export type MutableModel<
	T extends PersistentModel,
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	M extends PersistentModelMetaData<T> = {},
	// This provides Intellisense with ALL of the properties, regardless of read-only
	// but will throw a linting error if trying to overwrite a read-only property
> = DeepWritable<
	Omit<T, IdentifierFields<T, M> | MetadataReadOnlyFields<T, M>>
> &
	Readonly<Pick<T, IdentifierFields<T, M> | MetadataReadOnlyFields<T, M>>>;

export interface ModelInstanceMetadata {
	_version: number;
	_lastChangedAt: number;
	_deleted: boolean;
}

export type IdentifierFieldValue<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T>,
> =
	MetadataOrDefault<T, M>['identifier'] extends CompositeIdentifier<T, any>
		? MetadataOrDefault<T, M>['identifier']['fields'] extends [any]
			? T[MetadataOrDefault<T, M>['identifier']['fields'][0]]
			: never
		: MetadataOrDefault<T, M>['identifier'] extends GenericIdentifier
			? T[MetadataOrDefault<T, M>['identifier']['field']]
			: unknown;

export type IdentifierFieldOrIdentifierObject<
	T extends PersistentModel,
	M extends PersistentModelMetaData<T>,
> = Pick<T, IdentifierFields<T, M>> | IdentifierFieldValue<T, M>;

/**
 * @private
 * @param obj
 * @param modelDefinition
 * @returns `true` if the given item is an object that has all identifier fields populated.
 */
export function isIdentifierObject<T extends PersistentModel>(
	obj: any,
	modelDefinition: SchemaModel,
): obj is IdentifierFields<T extends PersistentModel ? T : never, any> {
	const keys = extractPrimaryKeyFieldNames(modelDefinition);

	return (
		typeof obj === 'object' && obj && keys.every(k => obj[k] !== undefined)
	);
}
// #endregion

// #region Subscription messages
export enum OpType {
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}

export type SubscriptionMessage<T extends PersistentModel> = Pick<
	InternalSubscriptionMessage<T>,
	'opType' | 'element' | 'model' | 'condition'
>;

export interface InternalSubscriptionMessage<T extends PersistentModel> {
	opType: OpType;
	element: T;
	model: PersistentModelConstructor<T>;
	condition: PredicatesGroup<T> | null;
	savedElement?: T;
}

export interface DataStoreSnapshot<T extends PersistentModel> {
	items: T[];
	isSynced: boolean;
}
// #endregion

// #region Predicates

export type PredicateExpression<M extends PersistentModel, FT> =
	TypeName<FT> extends keyof MapTypeToOperands<FT>
		? (
				operator: keyof MapTypeToOperands<FT>[TypeName<FT>],
				// make the operand type match the type they're trying to filter on
				operand: MapTypeToOperands<FT>[TypeName<FT>][keyof MapTypeToOperands<FT>[TypeName<FT>]],
			) => ModelPredicate<M>
		: never;

interface EqualityOperators<T> {
	ne: T;
	eq: T;
}
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
interface ArrayOperators<T> {
	contains: T;
	notContains: T;
}
export type AllOperators = NumberOperators<any> &
	StringOperators<any> &
	ArrayOperators<any>;

interface MapTypeToOperands<T> {
	number: NumberOperators<NonNullable<T>>;
	string: StringOperators<NonNullable<T>>;
	boolean: BooleanOperators<NonNullable<T>>;
	'number[]': ArrayOperators<number>;
	'string[]': ArrayOperators<string>;
	'boolean[]': ArrayOperators<boolean>;
}

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

export interface PredicateGroups<T extends PersistentModel> {
	and(
		predicate: (predicate: ModelPredicate<T>) => ModelPredicate<T>,
	): ModelPredicate<T>;
	or(
		predicate: (predicate: ModelPredicate<T>) => ModelPredicate<T>,
	): ModelPredicate<T>;
	not(
		predicate: (predicate: ModelPredicate<T>) => ModelPredicate<T>,
	): ModelPredicate<T>;
}

export type ModelPredicate<M extends PersistentModel> = {
	[K in keyof M]-?: PredicateExpression<M, NonNullable<M[K]>>;
} & PredicateGroups<M>;

export type ProducerModelPredicate<M extends PersistentModel> = (
	condition: ModelPredicate<M>,
) => ModelPredicate<M>;

export interface PredicatesGroup<T extends PersistentModel> {
	type: keyof PredicateGroups<T>;
	predicates: (PredicateObject<T> | PredicatesGroup<T>)[];
}

/**
 * @private
 * @param obj
 * @returns `true` if the given predicate field object, specifying an [in-]equality test against a field.
 */
export function isPredicateObj<T extends PersistentModel>(
	obj: any,
): obj is PredicateObject<T> {
	return obj && (obj as PredicateObject<T>).field !== undefined;
}

/**
 * @private
 * @param obj
 * @returns `true` if the given predicate object is a "group" like "and", "or", or "not".
 */
export function isPredicateGroup<T extends PersistentModel>(
	obj: any,
): obj is PredicatesGroup<T> {
	return obj && (obj as PredicatesGroup<T>).type !== undefined;
}

export interface PredicateObject<T extends PersistentModel> {
	field: keyof T;
	operator: keyof AllOperators;
	operand: any;
}

export enum QueryOne {
	FIRST,
	LAST,
}
export type GraphQLField = Record<
	string,
	Record<string, string | number | [number, number]>
>;

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

// #endregion

// #region Pagination

export interface ProducerPaginationInput<T extends PersistentModel> {
	sort?: ProducerSortPredicate<T>;
	limit?: number;
	page?: number;
}

export type ObserveQueryOptions<T extends PersistentModel> = Pick<
	ProducerPaginationInput<T>,
	'sort'
>;

export interface PaginationInput<T extends PersistentModel> {
	sort?: SortPredicate<T>;
	limit?: number;
	page?: number;
}

export type ProducerSortPredicate<M extends PersistentModel> = (
	condition: SortPredicate<M>,
) => SortPredicate<M>;

export type SortPredicate<T extends PersistentModel> = {
	[K in keyof T]-?: SortPredicateExpression<T, NonNullable<T[K]>>;
};

export type SortPredicateExpression<M extends PersistentModel, FT> =
	TypeName<FT> extends keyof MapTypeToOperands<FT>
		? (sortDirection: keyof typeof SortDirection) => SortPredicate<M>
		: never;

export enum SortDirection {
	ASCENDING = 'ASCENDING',
	DESCENDING = 'DESCENDING',
}

export type SortPredicatesGroup<T extends PersistentModel> =
	SortPredicateObject<T>[];

export interface SortPredicateObject<T extends PersistentModel> {
	field: keyof T;
	sortDirection: keyof typeof SortDirection;
}

// #endregion

// #region System Components

export interface SystemComponent {
	setUp(
		schema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: NAMESPACES,
			modelName: string,
		) => PersistentModelConstructor<any>,
		appId?: string,
	): Promise<void>;
}

export type NamespaceResolver = (
	modelConstructor: PersistentModelConstructor<any>,
) => string;

export interface ControlMessageType<T> {
	type: T;
	data?: any;
}

// #endregion

// #region Relationship types
export interface RelationType {
	fieldName: string;
	modelName: string;
	relationType: 'HAS_ONE' | 'HAS_MANY' | 'BELONGS_TO';
	targetName?: string;
	targetNames?: string[];
	associatedWith?: string | string[];
}

interface IndexOptions {
	unique?: boolean;
}

export type IndexesType = [string, string[], IndexOptions?][];

export type RelationshipType = Record<
	string,
	{
		indexes: IndexesType;
		relationTypes: RelationType[];
	}
>;

// #endregion

// #region Key type
export interface KeyType {
	primaryKey?: string[];
	compositeKeys?: Set<string>[];
}

export type ModelKeys = Record<string, KeyType>;

// #endregion

// #region DataStore config types
export interface DataStoreConfig {
	DataStore?: {
		authModeStrategyType?: AuthModeStrategyType;
		conflictHandler?: ConflictHandler; // default : retry until client wins up to x times
		errorHandler?(error: SyncError<PersistentModel>): void; // default : logger.warn
		maxRecordsToSync?: number; // merge
		syncPageSize?: number;
		fullSyncInterval?: number;
		syncExpressions?: SyncExpression[];
		authProviders?: AuthProviders;
		storageAdapter?: Adapter;
	};
	authModeStrategyType?: AuthModeStrategyType;
	conflictHandler?: ConflictHandler; // default : retry until client wins up to x times
	errorHandler?(error: SyncError<PersistentModel>): void; // default : logger.warn
	maxRecordsToSync?: number; // merge
	syncPageSize?: number;
	fullSyncInterval?: number;
	syncExpressions?: SyncExpression[];
	authProviders?: AuthProviders;
	storageAdapter?: Adapter;
}

export interface AuthProviders {
	functionAuthProvider(): { token: string } | Promise<{ token: string }>;
}

export enum AuthModeStrategyType {
	DEFAULT = 'DEFAULT',
	MULTI_AUTH = 'MULTI_AUTH',
}

export type AuthModeStrategyReturn =
	| GraphQLAuthMode
	| GraphQLAuthMode[]
	| undefined
	| null;

export interface AuthModeStrategyParams {
	schema: InternalSchema;
	modelName: string;
	operation: ModelOperation;
}

export type AuthModeStrategy = (
	authModeStrategyParams: AuthModeStrategyParams,
) => AuthModeStrategyReturn | Promise<AuthModeStrategyReturn>;

export enum ModelOperation {
	CREATE = 'CREATE',
	READ = 'READ',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}

export type ModelAuthModes = Record<
	string,
	Record<ModelOperation, GraphQLAuthMode[]>
>;

export type SyncExpression = Promise<{
	modelConstructor: any;
	conditionProducer(c?: any): any;
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

interface Lookup<T extends PersistentModel> {
	0:
		| ModelPredicateExtender<T>
		| Promise<ModelPredicateExtender<T>>
		| typeof PredicateAll
		| Promise<typeof PredicateAll | symbol>;
	1: PredicateInternalsKey | undefined;
}

type ConditionProducer<T extends PersistentModel, A extends Option<T>> = (
	...args: A
) => A['length'] extends keyof Lookup<T> ? Lookup<T>[A['length']] : never;

/**
 * Build an expression that can be used to filter which items of a given Model
 * are synchronized down from the GraphQL service. E.g.,
 *
 * ```ts
 * import { DataStore, syncExpression } from 'aws-amplify/datastore';
 * import { Post, Comment } from './models';
 *
 *
 * DataStore.configure({
 * 	syncExpressions: [
 * 		syncExpression(Post, () => {
 * 			return (post) => post.rating.gt(5);
 * 		}),
 * 		syncExpression(Comment, () => {
 * 			return (comment) => comment.status.eq('active');
 * 		})
 * 	]
 * });
 * ```
 *
 * When DataStore starts syncing, only Posts with `rating > 5` and Comments with
 * `status === 'active'` will be synced down to the user's local store.
 *
 * @param modelConstructor The Model from the schema.
 * @param conditionProducer A function that builds a condition object that can describe how to filter the model.
 * @returns An sync expression object that can be attached to the DataStore `syncExpressions` configuration property.
 */
export async function syncExpression<
	T extends PersistentModel,
	A extends Option<T>,
>(
	modelConstructor: PersistentModelConstructor<T>,
	conditionProducer: ConditionProducer<T, A>,
): Promise<{
	modelConstructor: PersistentModelConstructor<T>;
	conditionProducer: ConditionProducer<T, A>;
}> {
	return {
		modelConstructor,
		conditionProducer,
	};
}

export interface SyncConflict {
	modelConstructor: PersistentModelConstructor<any>;
	localModel: PersistentModel;
	remoteModel: PersistentModel;
	operation: OpType;
	attempts: number;
}

export interface SyncError<T extends PersistentModel> {
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
}

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
	conflict: SyncConflict,
) =>
	| Promise<PersistentModel | typeof DISCARD>
	| PersistentModel
	| typeof DISCARD;
export type ErrorHandler = (error: SyncError<PersistentModel>) => void;

export interface DeferredCallbackResolverOptions {
	callback(): void;
	maxInterval?: number;
	errorHandler?(error: string): void;
}

export enum LimitTimerRaceResolvedValues {
	LIMIT = 'LIMIT',
	TIMER = 'TIMER',
}
// #endregion

export interface AmplifyContext {
	InternalAPI: typeof InternalAPI;
}

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
	lambda: RecursiveModelPredicate<RT>,
) => PredicateInternalsKey;

export type RecursiveModelPredicateAggregateExtender<
	RT extends PersistentModel,
> = (lambda: RecursiveModelPredicate<RT>) => PredicateInternalsKey[];

export type RecursiveModelPredicateOperator<RT extends PersistentModel> = (
	predicates: RecursiveModelPredicateAggregateExtender<RT>,
) => PredicateInternalsKey;

export type RecursiveModelPredicateNegation<RT extends PersistentModel> = (
	predicate: RecursiveModelPredicateExtender<RT>,
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
	lambda: V5ModelPredicate<RT>,
) => PredicateInternalsKey;

export type ModelPredicateAggregateExtender<RT extends PersistentModel> = (
	lambda: V5ModelPredicate<RT>,
) => PredicateInternalsKey[];

export type ValuePredicate<
	_RT extends PersistentModel,
	MT extends MatchableTypes,
> = {
	[K in AllFieldOperators]: K extends 'between'
		? (
				inclusiveLowerBound: Scalar<MT>,
				inclusiveUpperBound: Scalar<MT>,
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
	predicates: ModelPredicateAggregateExtender<RT>,
) => PredicateInternalsKey;

export type ModelPredicateNegation<RT extends PersistentModel> = (
	predicate: ModelPredicateExtender<RT>,
) => PredicateInternalsKey;

/**
 * A pointer used by DataStore internally to lookup predicate details
 * that should not be exposed on public customer interfaces.
 */
export class PredicateInternalsKey {
	private __isPredicateInternalsKeySentinel = true;
}

// #endregion
