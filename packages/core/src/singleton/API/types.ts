// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Headers } from '../../clients';
import { AtLeastOne } from '../types';

export type LibraryAPIOptions = {
	GraphQL?: {
		// custom headers for given GraphQL service. Will be applied to all operations.
		headers?: (options?: {
			query?: string;
			variables?: Record<string, DocumentType>;
		}) => Promise<Headers | {}>;
		withCredentials?: boolean;
	};
	REST?: {
		// custom headers for given REST service. Will be applied to all operations.
		headers?: (options: { apiName: string }) => Promise<Headers>;
	};
};

type APIGraphQLConfig = {
	/**
	 * Required GraphQL endpoint, must be a valid URL string.
	 */
	endpoint: string;
	/**
	 * Optional region string used to sign the request. Required only if the auth mode is 'iam'.
	 */
	region?: string;
	/**
	 * Optional API key string. Required only if the auth mode is 'apiKey'.
	 */
	apiKey?: string;
	/**
	 * Custom domain endpoint for GraphQL API.
	 */
	customEndpoint?: string;
	/**
	 * Optional region string used to sign the request to `customEndpoint`. Effective only if `customEndpoint` is
	 * specified, and the auth mode is 'iam'.
	 */
	customEndpointRegion?: string;
	/**
	 * Default auth mode for all the API calls to given service.
	 */
	defaultAuthMode: GraphQLAuthMode;
	modelIntrospection?: ModelIntrospectionSchema;
};

type APIRestConfig = {
	/**
	 * Required REST endpoint, must be a valid URL string.
	 */
	endpoint: string;
	/**
	 * Optional region string used to sign the request with IAM credentials. If Omitted, region will be extracted from
	 * the endpoint.
	 *
	 * @default 'us-east-1'
	 */
	region?: string;
	/**
	 * Optional service name string to sign the request with IAM credentials.
	 *
	 * @default 'execute-api'
	 */
	service?: string;
};

export type RESTProviderConfig = {
	REST: Record<string, APIRestConfig>;
};

export type GraphQLProviderConfig = {
	GraphQL: APIGraphQLConfig;
};

export type APIConfig = AtLeastOne<RESTProviderConfig & GraphQLProviderConfig>;

export type GraphQLAuthMode =
	| 'apiKey'
	| 'oidc'
	| 'userPool'
	| 'iam'
	| 'lambda'
	| 'none';

/**
 * Type representing a plain JavaScript object that can be serialized to JSON.
 */
export type DocumentType =
	| null
	| boolean
	| number
	| string
	| DocumentType[]
	| { [prop: string]: DocumentType };

/**
 * Root model instrospection schema shape.
 *
 * Borrowed from: https://github.com/aws-amplify/samsara-cli/pull/377/commits/c08ea2c1a43f36aafe63b6d14d03f884e9c0c671#diff-21ae6faa2f22c15bb25ff9b272eaab7846c0650e2d267ab720546c19559583d0R4-R108
 */
export type ModelIntrospectionSchema = {
	version: 1;
	models: SchemaModels;
	nonModels: SchemaNonModels;
	enums: SchemaEnums;
};

/**
 * Top-level Entities on a Schema
 */
export type SchemaModels = Record<string, SchemaModel>;
export type SchemaNonModels = Record<string, SchemaNonModel>;
export type SchemaEnums = Record<string, SchemaEnum>;

export type SchemaModel = {
	name: string;
	attributes?: ModelAttribute[];
	fields: Fields;
	pluralName: string;
	syncable?: boolean;
	primaryKeyInfo: PrimaryKeyInfo;
};
export type SchemaNonModel = {
	name: string;
	fields: Fields;
};
export type SchemaEnum = {
	name: string;
	values: string[];
};

export type ModelAttribute = {
	type: string;
	properties?: { [key: string]: any };
};

/**
 * Field Definition
 */
export type Fields = Record<string, Field>;
export type Field = {
	name: string;
	type: FieldType;
	isArray: boolean;
	isRequired: boolean;
	isReadOnly?: boolean;
	isArrayNullable?: boolean;
	attributes?: FieldAttribute[];
	association?: AssociationType;
};

export type ModelFieldType = { model: string };

export type FieldType =
	| 'ID'
	| 'String'
	| 'Int'
	| 'Float'
	| 'AWSDate'
	| 'AWSTime'
	| 'AWSDateTime'
	| 'AWSTimestamp'
	| 'AWSEmail'
	| 'AWSURL'
	| 'AWSIPAddress'
	| 'Boolean'
	| 'AWSJSON'
	| 'AWSPhone'
	| { enum: string }
	| ModelFieldType
	| { nonModel: string };
export type FieldAttribute = ModelAttribute;

/**
 * Field-level Relationship Definitions
 */
export enum CodeGenConnectionType {
	HAS_ONE = 'HAS_ONE',
	BELONGS_TO = 'BELONGS_TO',
	HAS_MANY = 'HAS_MANY',
}
export type AssociationBaseType = {
	connectionType: CodeGenConnectionType;
};

export type AssociationHasMany = AssociationBaseType & {
	connectionType: CodeGenConnectionType.HAS_MANY;
	associatedWith: string[];
};
export type AssociationHasOne = AssociationBaseType & {
	connectionType: CodeGenConnectionType.HAS_ONE;
	associatedWith: string[];
	targetNames: string[];
};

export type AssociationBelongsTo = AssociationBaseType & {
	connectionType: CodeGenConnectionType.BELONGS_TO;
	targetNames: string[];
};
export type AssociationType =
	| AssociationHasMany
	| AssociationHasOne
	| AssociationBelongsTo;

export type PrimaryKeyInfo = {
	isCustomPrimaryKey: boolean;
	primaryKeyFieldName: string;
	sortKeyFieldNames: string[];
};
