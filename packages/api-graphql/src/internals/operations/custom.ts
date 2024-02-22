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


export function customOpFactory(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	operationType: 'query' | 'mutation',
	operation: CustomOperation,
	useContext = false
) {
	const opWithContext = async (
		contextSpec: AmplifyServer.ContextSpec & GraphQLOptionsV6<unknown, string>,
		arg?: QueryArgs,
		options?: any
	) => {
		return _op(
			client,
			modelIntrospection,
			operationType,
			operation,
			arg,
			options,
			contextSpec
		);
	};

	const op = async (arg?: QueryArgs, options?: any) => {
		return _op(
			client,
			modelIntrospection,
			operationType,
			operation,
			arg,
			options
		);
	};

	return useContext ? opWithContext : op;
}

/**
 * Checks whether a specific argument is defined on an arguments object.
 *
 * @param args Arguments object to check.
 * @param argDef Argument definition to check for.
 * @returns true if argument is present; false if not.
 * @throws If argument is required and not present.
 */
function hasValidArgument<ArgumentType extends CustomOperationArgument>(
	args: any,
	argDef: ArgumentType
): args is Record<ArgumentType['name'], any> {
	const argValue = args[argDef.name];
	const argJSType = typeof argValue;
	if (argJSType !== 'undefined') {
		return true;
	} else if (argDef.isRequired) {
		throw new Error(`Argument ${argDef.name}: ${argDef.type} is required.`);
	} else {
		return false;
	}
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
	field: Field
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
	nonModel: SchemaModel | SchemaNonModel
): string {
	return Object.values(nonModel.fields)
		.filter(
			field =>
				hasStringField(field, 'type') ||
				hasStringField(field.type, 'nonModel') ||
				hasStringField(field.type, 'enum')
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
	operation: CustomOperation
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

function operationVariables(
	operation: CustomOperation,
	args?: QueryArgs
): Record<string, any> {
	const variables = {} as Record<string, any>;
	for (const argDef of Object.values(operation.arguments)) {
		if (hasValidArgument(args, argDef)) {
			variables[argDef.name] = args[argDef.name];
		}
	}
	return variables;
}

async function _op(
	client: ClientWithModels,
	modelIntrospection: ModelIntrospectionSchema,
	operationType: 'query' | 'mutation',
	operation: CustomOperation,
	args?: QueryArgs,
	options?: AuthModeParams & ListArgs,
	context?: AmplifyServer.ContextSpec
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
					headers
			  )) as GraphQLResult<any>)
			: ((await (client as V6Client<Record<string, any>>).graphql(
					{
						...auth,
						query,
						variables,
					},
					headers
			  )) as GraphQLResult<any>);

		// flatten response
		if (data) {
			const [key] = Object.keys(data);
			const flattenedResult = flattenItems(data)[key];

			// TODO: custom selection set
			const [initialized] = returnTypeModelName
				? initializeModel(
						client,
						returnTypeModelName,
						[flattenedResult],
						modelIntrospection,
						auth.authMode,
						auth.authToken,
						!!context
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
