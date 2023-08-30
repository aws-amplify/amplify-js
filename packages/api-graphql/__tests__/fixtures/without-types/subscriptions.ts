/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateThread = /* GraphQL */ `
	subscription OnCreateThread(
		$filter: ModelSubscriptionThreadFilterInput
		$owner: String
	) {
		onCreateThread(filter: $filter, owner: $owner) {
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

export const onUpdateThread = /* GraphQL */ `
	subscription OnUpdateThread(
		$filter: ModelSubscriptionThreadFilterInput
		$owner: String
	) {
		onUpdateThread(filter: $filter, owner: $owner) {
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

export const onDeleteThread = /* GraphQL */ `
	subscription OnDeleteThread(
		$filter: ModelSubscriptionThreadFilterInput
		$owner: String
	) {
		onDeleteThread(filter: $filter, owner: $owner) {
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
