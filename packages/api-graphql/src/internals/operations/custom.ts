// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';
import {
	initializeModel,
	flattenItems,
	authModeParams,
	getCustomHeaders,
} from '../APIClient';
import {
	AuthModeParams,
	ClientWithModels,
	GraphQLOptionsV6,
	GraphQLResult,
	ListArgs,
	QueryArgs,
	V6Client,
	V6ClientSSRRequest,
} from '../../types';
import {
	ModelIntrospectionSchema,
	SchemaModel,
	SchemaNonModel,
	CustomOperation,
	CustomOperationArgument,
} from '@aws-amplify/core/internals/utils';

/**
 * Builds an operation function, embedded with all client and context data, that
 * can be attached to a client as a custom query or mutation.
 *
 * If we have this source schema:
 *
 * ```typescript
 * a.schema({
 *   echo: a.query()
 *     .arguments({input: a.string().required()})
 *     .returns(a.string())
 * })
 * ```
 *
 * Our model intro schema will contain an entry like this:
 *
 * ```ts
 * {
 *   queries: {
 *     echo: {
 *       name: "echo",
 *       isArray: false,
 *       type: 'String',
 *       isRequired: false,
 *       arguments: {
 *         input: {
 *           name: 'input',
 *           isArray: false,
 *           type: String,
 *           isRequired: true
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * The `echo` object is used to build the `echo' method that goes here:
 *
 * ```typescript
 * const client = generateClent()
 * const { data } = await client.queries.echo({input: 'a string'});
 * //                                    ^
 * //                                    |
 * //                                    +-- This one right here.
 * //
 * ```
 *
 *
 * @param client The client to run graphql queries through.
 * @param modelIntrospection The model introspection schema the op comes from.
 * @param operationType The broad category of graphql operation.
 * @param operation The operation definition from the introspection schema.
 * @param useContext Whether the function needs to accept an SSR context.
 * @returns The operation function to attach to query, mutations, etc.
 */
export function customOpFactory(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	operationType: 'query' | 'mutation',
	operation: CustomOperation,
	useContext: boolean,
) {
	const opWithContext = async (
		contextSpec: AmplifyServer.ContextSpec & GraphQLOptionsV6<unknown, string>,
		arg?: QueryArgs,
		options?: AuthModeParams & ListArgs,
	) => {
		return _op(
			client,
			modelIntrospection,
			operationType,
			operation,
			arg,
			options,
			contextSpec,
		);
	};

	const op = async (arg?: QueryArgs, options?: AuthModeParams & ListArgs) => {
		return _op(
			client,
			modelIntrospection,
			operationType,
			operation,
			arg,
			options,
		);
	};

	return useContext ? opWithContext : op;
}

/**
 * Runtime test and type guard to check whether `o[field]` is a `String`.
 *
 * ```typescript
 * if (hasStringField(o, 'prop')) {
 *   const s = o.prop;
 *   //    ^? const s: string
 * }
 * ```
 *
 * @param o Object to inspect
 * @param field Field to look for
 * @returns Boolean: `true` if the `o[field]` is a `string`
 */
function hasStringField<Field extends string>(
	o: any,
	field: Field,
): o is Record<Field, string> {
	return typeof o[field] === 'string';
}

/**
 * Generates "outer" arguments string for a custom operation. For example,
 * in this operation:
 *
 * ```graphql
 * query MyQuery(InputString: String!) {
 *   echoString(InputString: $InputString)
 * }
 * ```
 *
 * This function returns the top/outer level arguments as a string:
 *
 * ```json
 * "InputString: String!"
 * ```
 *
 * @param operation Operation object from model introspection schema.
 * @returns "outer" arguments string
 */
function outerArguments(operation: CustomOperation): string {
	const args = Object.entries(operation.arguments)
		.map(([k, v]) => {
			const baseType = v.type + (v.isRequired ? '!' : '');
			const finalType = v.isArray
				? `[${baseType}]${v.isArrayNullable ? '' : '!'}`
				: baseType;
			return `$${k}: ${finalType}`;
		})
		.join(', ');
	return args.length > 0 ? `(${args})` : '';
}

/**
 * Generates "inner" arguments string for a custom operation. For example,
 * in this operation:
 *
 * ```graphql
 * query MyQuery(InputString: String!) {
 *   echoString(InputString: $InputString)
 * }
 * ```
 *
 * This function returns the inner arguments as a string:
 *
 * ```json
 * "InputString: $InputString"
 * ```
 *
 * @param operation Operation object from model introspection schema.
 * @returns "outer" arguments string
 */
function innerArguments(operation: CustomOperation): string {
	const args = Object.entries(operation.arguments)
		.map(([k, v]) => `${k}: $${k}`)
		.join(', ');
	return args.length > 0 ? `(${args})` : '';
}

/**
 * Accepts a Model or NonModel from generated introspection schema and
 * generates the selection set string.
 *
 * @param nonModel Model or nonModel object from introspection schema.
 * @returns String selection set.
 */
function modelishTypeSelectionSet(
	nonModel: SchemaModel | SchemaNonModel,
): string {
	return Object.values(nonModel.fields)
		.filter(
			field =>
				hasStringField(field, 'type') ||
				hasStringField(field.type, 'nonModel') ||
				hasStringField(field.type, 'enum'),
		)
		.map(field => field.name)
		.join(' ');
}

/**
 * Generates the selection set string for a custom operation. This is slightly
 * different than the selection set generation for models. If the custom op returns
 * a primitive or enum types, it doen't require a selection set at all.
 *
 * E.g., the graphql might look like this:
 *
 * ```graphql
 * query MyQuery {
 *   echoString(inputString: "whatever")
 * }
 * #                                     ^
 * #                                     |
 * #                                     +-- no selection set
 * ```
 *
 * Non-primitive return type selection set generation will be similar to other
 * model operations.
 *
 * @param modelIntrospection The full code-generated introspection schema.
 * @param operation The operation object from the schema.
 * @returns The selection set as a string.
 */
function operationSelectionSet(
	modelIntrospection: ModelIntrospectionSchema,
	operation: CustomOperation,
): string {
	if (
		hasStringField(operation, 'type') ||
		hasStringField(operation.type, 'enum')
	) {
		return '';
	} else if (hasStringField(operation.type, 'nonModel')) {
		const model = modelIntrospection.nonModels[operation.type.nonModel];
		return `{${modelishTypeSelectionSet(model)}}`;
	} else if (hasStringField(operation.type, 'model')) {
		const nonModel = modelIntrospection.models[operation.type.model];
		return `{${modelishTypeSelectionSet(nonModel)}}`;
	} else {
		return '';
	}
}

/**
 * Maps an arguments objec to graphql variables, removing superfluous args and
 * screaming loudly when required args are missing.
 *
 * @param operation The operation to construct graphql request variables for.
 * @param args The arguments to map variables from.
 * @returns The graphql variables object.
 */
function operationVariables(
	operation: CustomOperation,
	args: QueryArgs = {},
): Record<string, unknown> {
	const variables = {} as Record<string, unknown>;
	for (const argDef of Object.values(operation.arguments)) {
		if (typeof args[argDef.name] !== 'undefined') {
			variables[argDef.name] = args[argDef.name];
		} else if (argDef.isRequired) {
			// At this point, the variable is both required and missing: We don't need
			// to continue. The operation is expected to fail.
			throw new Error(`${operation.name} requires arguments '${argDef.name}'`);
		}
	}
	return variables;
}

/**
 * Executes an operation from the given model intro schema against a client, returning
 * a fully instantiated model when relevant.
 *
 * @param client The client to operate `graphql()` calls through.
 * @param modelIntrospection The model intro schema to construct requests from.
 * @param operationType The high level graphql operation type.
 * @param operation The specific operation name, args, return type details.
 * @param args The arguments to provide to the operation as variables.
 * @param options Request options like headers, etc.
 * @param context SSR context if relevant.
 * @returns Result from the graphql request, model-instantiated when relevant.
 */
async function _op(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	operationType: 'query' | 'mutation',
	operation: CustomOperation,
	args?: QueryArgs,
	options?: AuthModeParams & ListArgs,
	context?: AmplifyServer.ContextSpec,
) {
	const { name: operationName } = operation;
	const auth = authModeParams(client, options);
	const headers = getCustomHeaders(client, options?.headers);
	const outerArgsString = outerArguments(operation);
	const innerArgsString = innerArguments(operation);
	const selectionSet = operationSelectionSet(modelIntrospection, operation);

	const returnTypeModelName = hasStringField(operation.type, 'model')
		? operation.type.model
		: undefined;

	const query = `
		${operationType.toLocaleLowerCase()}${outerArgsString} {
			${operationName}${innerArgsString} ${selectionSet}
		}
	`;

	const variables = operationVariables(operation, args);

	try {
		const { data, extensions } = context
			? ((await (client as V6ClientSSRRequest<Record<string, any>>).graphql(
					context,
					{
						...auth,
						query,
						variables,
					},
					headers,
				)) as GraphQLResult<any>)
			: ((await (client as V6Client<Record<string, any>>).graphql(
					{
						...auth,
						query,
						variables,
					},
					headers,
				)) as GraphQLResult<any>);

		// flatten response
		if (data) {
			const [key] = Object.keys(data);
			const flattenedResult = flattenItems(data)[key];

			// TODO: custom selection set. current selection set is default selection set only
			// custom selection set requires data-schema-type + runtime updates above.
			const [initialized] = returnTypeModelName
				? initializeModel(
						client,
						returnTypeModelName,
						[flattenedResult],
						modelIntrospection,
						auth.authMode,
						auth.authToken,
						!!context,
					)
				: [flattenedResult];

			return { data: initialized, extensions };
		} else {
			return { data: null, extensions };
		}
	} catch (error: any) {
		if (error.errors) {
			// graphql errors pass through
			return error as any;
		} else {
			// non-graphql errors re re-thrown
			throw error;
		}
	}
}
