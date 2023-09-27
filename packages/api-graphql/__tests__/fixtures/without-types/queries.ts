/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getThread = /* GraphQL */ `
	query GetThread($id: ID!) {
		getThread(id: $id) {
			id
			topic
			comments {
				items {
					id
					owner
					body
					createdAt
					updatedAt
					threadCommentsId
				}
				nextToken
			}
			createdAt
			updatedAt
			owner
		}
	}
`;

export const listThreads = /* GraphQL */ `
	query ListThreads(
		$filter: ModelThreadFilterInput
		$limit: Int
		$nextToken: String
	) {
		listThreads(filter: $filter, limit: $limit, nextToken: $nextToken) {
			items {
				id
				topic
				comments {
					nextToken
				}
				createdAt
				updatedAt
				owner
			}
			nextToken
		}
	}
`;
