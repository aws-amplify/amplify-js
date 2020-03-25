import { parse, print } from 'graphql';
import { SchemaNamespace } from '../src';
import {
	buildGraphQLOperation,
	buildSubscriptionGraphQLOperation,
	TransformerMutationType,
} from '../src/sync/utils';
import { newSchema } from './schema';

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

describe('DataStore GraphQL generation', () => {
	test.each([
		[
			'LIST',
			/* GraphQL */ `
				query operation(
					$limit: Int
					$nextToken: String
					$lastSync: AWSTimestamp
				) {
					syncPosts(limit: $limit, nextToken: $nextToken, lastSync: $lastSync) {
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
