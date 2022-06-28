import { parse, print } from 'graphql';
import { SchemaNamespace } from '../src';
import {
	buildGraphQLOperation,
	buildSubscriptionGraphQLOperation,
	generateSelectionSet,
	TransformerMutationType,
	predicateToGraphQLFilter,
} from '../src/sync/utils';
import { PredicatesGroup } from '../src/types';
import {
	explicitOwnerSchema,
	groupSchema,
	implicitOwnerSchema,
	newSchema,
} from './__utils__/schema';

const postSelectionSet = `
id
title
metadata {
	rating
	tags
	nested {
		aField
	}
}
_version
_lastChangedAt
_deleted
reference {
	id
	_deleted
}
blog {
	id
	_deleted
}
`;

const ownerAuthPostSelectionSet = `id
title
owner
_version
_lastChangedAt
_deleted`;

const groupAuthPostSelectionSet = `id
title
_version
_lastChangedAt
_deleted`;

describe('DataStore GraphQL generation', () => {
	test.each([
		[
			'LIST',
			/* GraphQL */ `
				query operation(
					$limit: Int
					$nextToken: String
					$lastSync: AWSTimestamp
					$filter: ModelPostFilterInput
				) {
					syncPosts(limit: $limit, nextToken: $nextToken, lastSync: $lastSync, filter: $filter) {
						items {
							${postSelectionSet}
						}
						nextToken
						startedAt
					}
				}
			`,
		],
		[
			'CREATE',
			/* GraphQL */ `
				mutation operation($input: CreatePostInput!) {
					createPost(input: $input) {
						${postSelectionSet}
					}
				}
			`,
		],
		[
			'UPDATE',
			/* GraphQL */ `
				mutation operation(
					$input: UpdatePostInput!
					$condition: ModelPostConditionInput
				) {
					updatePost(input: $input, condition: $condition) {
						${postSelectionSet}
					}
				}
			`,
		],
		,
		[
			'DELETE',
			/* GraphQL */ `
				mutation operation(
					$input: DeletePostInput!
					$condition: ModelPostConditionInput
				) {
					deletePost(input: $input, condition: $condition) {
						${postSelectionSet}
					}
				}
			`,
		],
		,
		[
			'GET',
			/* GraphQL */ `
				query operation($id: ID!) {
					getPost(id: $id) {
						${postSelectionSet}
					}
				}
			`,
		],
	])(
		'%s - has full selection set including types, and inputs',
		(graphQLOpType, expectedGraphQL) => {
			const namespace = <SchemaNamespace>(<unknown>newSchema);

			const {
				models: { Post: postModelDefinition },
			} = namespace;

			const [[, , query]] = buildGraphQLOperation(
				namespace,
				postModelDefinition,
				<any>graphQLOpType
			);

			expect(print(parse(query))).toStrictEqual(print(parse(expectedGraphQL)));
		}
	);

	test.each([
		[
			TransformerMutationType.CREATE,
			/* GraphQL */ `
				subscription operation {
					onCreatePost {
						${postSelectionSet}
					}
				}
			`,
		],
		[
			TransformerMutationType.UPDATE,
			/* GraphQL */ `
				subscription operation {
					onUpdatePost {
						${postSelectionSet}
					}
				}
			`,
		],
		[
			TransformerMutationType.DELETE,
			/* GraphQL */ `
				subscription operation {
					onDeletePost {
						${postSelectionSet}
					}
				}
			`,
		],
	])(
		'Subscription (%s)  - has full selection set including types, and inputs',
		(transformerMutationType, expectedGraphQL) => {
			const namespace = <SchemaNamespace>(<unknown>newSchema);

			const {
				models: { Post: postModelDefinition },
			} = namespace;

			const [, , query] = buildSubscriptionGraphQLOperation(
				namespace,
				postModelDefinition,
				<any>transformerMutationType,
				false,
				''
			);

			expect(print(parse(query))).toStrictEqual(print(parse(expectedGraphQL)));
		}
	);
});

describe('DataStore GraphQL selection set generation', () => {
	test('Implicit owner auth - owner field is added', () => {
		const namespace = <SchemaNamespace>(<unknown>implicitOwnerSchema);

		const {
			models: { Post: postModelDefinition },
		} = namespace;

		const selectionSet = generateSelectionSet(namespace, postModelDefinition);

		expect(selectionSet).toStrictEqual(ownerAuthPostSelectionSet);
	});

	test('Explicit owner auth - owner field is added', () => {
		const namespace = <SchemaNamespace>(<unknown>explicitOwnerSchema);

		const {
			models: { Post: postModelDefinition },
		} = namespace;

		const selectionSet = generateSelectionSet(namespace, postModelDefinition);

		expect(selectionSet).toStrictEqual(ownerAuthPostSelectionSet);
	});

	test('Group auth - owner field is NOT added', () => {
		const namespace = <SchemaNamespace>(<unknown>groupSchema);

		const {
			models: { Post: postModelDefinition },
		} = namespace;

		const selectionSet = generateSelectionSet(namespace, postModelDefinition);

		expect(selectionSet).toStrictEqual(groupAuthPostSelectionSet);
	});
});

describe('DataStore PredicateGroups to GraphQL filter', () => {
	test('Single field', () => {
		const group: PredicatesGroup<any> = {
			type: 'and',
			predicates: [{ field: 'someField', operator: 'eq', operand: 'value' }],
		};

		const groupExpected = { and: [{ someField: { eq: 'value' } }] };

		const gqlResult = predicateToGraphQLFilter(group);

		// stringifying to normalize whitespace and escape chars
		expect(JSON.stringify(gqlResult)).toStrictEqual(
			JSON.stringify(groupExpected)
		);
	});

	test('Multiple field', () => {
		const group: PredicatesGroup<any> = {
			type: 'and',
			predicates: [
				{ field: 'someField', operator: 'eq', operand: 'value' },
				{ field: 'someOtherField', operator: 'gt', operand: 'value2' },
			],
		};

		const groupExpected = {
			and: [
				{ someField: { eq: 'value' } },
				{ someOtherField: { gt: 'value2' } },
			],
		};

		const gqlResult = predicateToGraphQLFilter(group);

		expect(JSON.stringify(gqlResult)).toStrictEqual(
			JSON.stringify(groupExpected)
		);
	});

	test('Nested field', () => {
		const group: PredicatesGroup<any> = {
			type: 'and',
			predicates: [
				{ field: 'someField', operator: 'eq', operand: 'value' },
				{
					type: 'or',
					predicates: [
						{ field: 'someOtherField', operator: 'gt', operand: 'value2' },
						{ field: 'orField', operator: 'contains', operand: 'str' },
					],
				},
			],
		};

		const groupExpected = {
			and: [
				{ someField: { eq: 'value' } },
				{
					or: [
						{ someOtherField: { gt: 'value2' } },
						{ orField: { contains: 'str' } },
					],
				},
			],
		};

		const gqlResult = predicateToGraphQLFilter(group);

		expect(JSON.stringify(gqlResult)).toStrictEqual(
			JSON.stringify(groupExpected)
		);
	});

	test('Nested not', () => {
		const group: PredicatesGroup<any> = {
			type: 'not',
			predicates: [
				{
					type: 'or',
					predicates: [
						{ field: 'someOtherField', operator: 'gt', operand: 'value2' },
						{ field: 'orField', operator: 'contains', operand: 'str' },
					],
				},
			],
		};

		const groupExpected = {
			not: {
				or: [
					{ someOtherField: { gt: 'value2' } },
					{ orField: { contains: 'str' } },
				],
			},
		};

		const gqlResult = predicateToGraphQLFilter(group);

		expect(JSON.stringify(gqlResult)).toStrictEqual(
			JSON.stringify(groupExpected)
		);
	});
});
