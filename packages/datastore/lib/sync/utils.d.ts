import { ModelInstanceCreator } from '../datastore/datastore';
import {
	AuthorizationRule,
	GraphQLCondition,
	OpType,
	PersistentModel,
	PersistentModelConstructor,
	PredicatesGroup,
	RelationshipType,
	SchemaModel,
} from '../types';
import { MutationEvent } from './';
declare enum GraphQLOperationType {
	LIST = 'query',
	CREATE = 'mutation',
	UPDATE = 'mutation',
	DELETE = 'mutation',
	GET = 'query',
}
export declare enum TransformerMutationType {
	CREATE = 'Create',
	UPDATE = 'Update',
	DELETE = 'Delete',
	GET = 'Get',
}
export declare function getMetadataFields(): ReadonlyArray<string>;
export declare function getAuthorizationRules(
	modelDefinition: SchemaModel,
	transformerOpType: TransformerMutationType
): AuthorizationRule[];
export declare function buildSubscriptionGraphQLOperation(
	modelDefinition: SchemaModel,
	transformerMutationType: TransformerMutationType,
	isOwnerAuthorization: boolean,
	ownerField: string
): [TransformerMutationType, string, string];
export declare function buildGraphQLOperation(
	modelDefinition: SchemaModel,
	graphQLOpType: keyof typeof GraphQLOperationType
): [TransformerMutationType, string, string][];
export declare function createMutationInstanceFromModelOperation<
	T extends PersistentModel
>(
	relationships: RelationshipType,
	modelDefinition: SchemaModel,
	opType: OpType,
	model: PersistentModelConstructor<T>,
	element: T,
	condition: GraphQLCondition,
	MutationEventConstructor: PersistentModelConstructor<MutationEvent>,
	modelInstanceCreator: ModelInstanceCreator,
	id?: string
): MutationEvent;
export declare function predicateToGraphQLCondition(
	predicate: PredicatesGroup<any>
): GraphQLCondition;
export {};
