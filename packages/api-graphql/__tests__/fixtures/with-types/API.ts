/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateThreadInput = {
	id?: string | null;
	topic?: string | null;
	createdAt?: string | null;
};

export type ModelThreadConditionInput = {
	topic?: ModelStringInput | null;
	createdAt?: ModelStringInput | null;
	and?: Array<ModelThreadConditionInput | null> | null;
	or?: Array<ModelThreadConditionInput | null> | null;
	not?: ModelThreadConditionInput | null;
};

export type ModelStringInput = {
	ne?: string | null;
	eq?: string | null;
	le?: string | null;
	lt?: string | null;
	ge?: string | null;
	gt?: string | null;
	contains?: string | null;
	notContains?: string | null;
	between?: Array<string | null> | null;
	beginsWith?: string | null;
	attributeExists?: boolean | null;
	attributeType?: ModelAttributeTypes | null;
	size?: ModelSizeInput | null;
};

export enum ModelAttributeTypes {
	binary = 'binary',
	binarySet = 'binarySet',
	bool = 'bool',
	list = 'list',
	map = 'map',
	number = 'number',
	numberSet = 'numberSet',
	string = 'string',
	stringSet = 'stringSet',
	_null = '_null',
}

export type ModelSizeInput = {
	ne?: number | null;
	eq?: number | null;
	le?: number | null;
	lt?: number | null;
	ge?: number | null;
	gt?: number | null;
	between?: Array<number | null> | null;
};

export type Thread = {
	__typename: 'Thread';
	id: string;
	topic?: string | null;
	comments?: ModelCommentConnection | null;
	createdAt?: string | null;
	updatedAt: string;
	owner?: string | null;
};

export type ModelCommentConnection = {
	__typename: 'ModelCommentConnection';
	items: Array<Comment | null>;
	nextToken?: string | null;
};

export type Comment = {
	__typename: 'Comment';
	id: string;
	owner?: string | null;
	body: string;
	thread: Thread;
	createdAt?: string | null;
	updatedAt: string;
	threadCommentsId?: string | null;
};

export type UpdateThreadInput = {
	id: string;
	topic?: string | null;
	createdAt?: string | null;
};

export type DeleteThreadInput = {
	id: string;
};

export type CreateCommentInput = {
	id?: string | null;
	owner?: string | null;
	body: string;
	createdAt?: string | null;
	threadCommentsId?: string | null;
};

export type ModelCommentConditionInput = {
	owner?: ModelStringInput | null;
	body?: ModelStringInput | null;
	createdAt?: ModelStringInput | null;
	and?: Array<ModelCommentConditionInput | null> | null;
	or?: Array<ModelCommentConditionInput | null> | null;
	not?: ModelCommentConditionInput | null;
	threadCommentsId?: ModelIDInput | null;
};

export type ModelIDInput = {
	ne?: string | null;
	eq?: string | null;
	le?: string | null;
	lt?: string | null;
	ge?: string | null;
	gt?: string | null;
	contains?: string | null;
	notContains?: string | null;
	between?: Array<string | null> | null;
	beginsWith?: string | null;
	attributeExists?: boolean | null;
	attributeType?: ModelAttributeTypes | null;
	size?: ModelSizeInput | null;
};

export type UpdateCommentInput = {
	id: string;
	owner?: string | null;
	body?: string | null;
	createdAt?: string | null;
	threadCommentsId?: string | null;
};

export type DeleteCommentInput = {
	id: string;
};

export type ModelThreadFilterInput = {
	id?: ModelIDInput | null;
	topic?: ModelStringInput | null;
	createdAt?: ModelStringInput | null;
	and?: Array<ModelThreadFilterInput | null> | null;
	or?: Array<ModelThreadFilterInput | null> | null;
	not?: ModelThreadFilterInput | null;
};

export type ModelThreadConnection = {
	__typename: 'ModelThreadConnection';
	items: Array<Thread | null>;
	nextToken?: string | null;
};

export type ModelCommentFilterInput = {
	id?: ModelIDInput | null;
	owner?: ModelStringInput | null;
	body?: ModelStringInput | null;
	createdAt?: ModelStringInput | null;
	and?: Array<ModelCommentFilterInput | null> | null;
	or?: Array<ModelCommentFilterInput | null> | null;
	not?: ModelCommentFilterInput | null;
	threadCommentsId?: ModelIDInput | null;
};

export type ModelSubscriptionThreadFilterInput = {
	id?: ModelSubscriptionIDInput | null;
	topic?: ModelSubscriptionStringInput | null;
	createdAt?: ModelSubscriptionStringInput | null;
	and?: Array<ModelSubscriptionThreadFilterInput | null> | null;
	or?: Array<ModelSubscriptionThreadFilterInput | null> | null;
};

export type ModelSubscriptionIDInput = {
	ne?: string | null;
	eq?: string | null;
	le?: string | null;
	lt?: string | null;
	ge?: string | null;
	gt?: string | null;
	contains?: string | null;
	notContains?: string | null;
	between?: Array<string | null> | null;
	beginsWith?: string | null;
	in?: Array<string | null> | null;
	notIn?: Array<string | null> | null;
};

export type ModelSubscriptionStringInput = {
	ne?: string | null;
	eq?: string | null;
	le?: string | null;
	lt?: string | null;
	ge?: string | null;
	gt?: string | null;
	contains?: string | null;
	notContains?: string | null;
	between?: Array<string | null> | null;
	beginsWith?: string | null;
	in?: Array<string | null> | null;
	notIn?: Array<string | null> | null;
};

export type ModelSubscriptionCommentFilterInput = {
	id?: ModelSubscriptionIDInput | null;
	body?: ModelSubscriptionStringInput | null;
	createdAt?: ModelSubscriptionStringInput | null;
	and?: Array<ModelSubscriptionCommentFilterInput | null> | null;
	or?: Array<ModelSubscriptionCommentFilterInput | null> | null;
};

export type CreateThreadMutationVariables = {
	input: CreateThreadInput;
	condition?: ModelThreadConditionInput | null;
};

export type CreateThreadMutation = {
	createThread?: {
		__typename: 'Thread';
		id: string;
		topic?: string | null;
		comments?: {
			__typename: 'ModelCommentConnection';
			items: Array<{
				__typename: 'Comment';
				id: string;
				owner?: string | null;
				body: string;
				createdAt?: string | null;
				updatedAt: string;
				threadCommentsId?: string | null;
			} | null>;
			nextToken?: string | null;
		} | null;
		createdAt?: string | null;
		updatedAt: string;
		owner?: string | null;
	} | null;
};

export type UpdateThreadMutationVariables = {
	input: UpdateThreadInput;
	condition?: ModelThreadConditionInput | null;
};

export type UpdateThreadMutation = {
	updateThread?: {
		__typename: 'Thread';
		id: string;
		topic?: string | null;
		comments?: {
			__typename: 'ModelCommentConnection';
			items: Array<{
				__typename: 'Comment';
				id: string;
				owner?: string | null;
				body: string;
				createdAt?: string | null;
				updatedAt: string;
				threadCommentsId?: string | null;
			} | null>;
			nextToken?: string | null;
		} | null;
		createdAt?: string | null;
		updatedAt: string;
		owner?: string | null;
	} | null;
};

export type DeleteThreadMutationVariables = {
	input: DeleteThreadInput;
	condition?: ModelThreadConditionInput | null;
};

export type DeleteThreadMutation = {
	deleteThread?: {
		__typename: 'Thread';
		id: string;
		topic?: string | null;
		comments?: {
			__typename: 'ModelCommentConnection';
			items: Array<{
				__typename: 'Comment';
				id: string;
				owner?: string | null;
				body: string;
				createdAt?: string | null;
				updatedAt: string;
				threadCommentsId?: string | null;
			} | null>;
			nextToken?: string | null;
		} | null;
		createdAt?: string | null;
		updatedAt: string;
		owner?: string | null;
	} | null;
};

export type CreateCommentMutationVariables = {
	input: CreateCommentInput;
	condition?: ModelCommentConditionInput | null;
};

export type CreateCommentMutation = {
	createComment?: {
		__typename: 'Comment';
		id: string;
		owner?: string | null;
		body: string;
		thread: {
			__typename: 'Thread';
			id: string;
			topic?: string | null;
			comments?: {
				__typename: 'ModelCommentConnection';
				nextToken?: string | null;
			} | null;
			createdAt?: string | null;
			updatedAt: string;
			owner?: string | null;
		};
		createdAt?: string | null;
		updatedAt: string;
		threadCommentsId?: string | null;
	} | null;
};

export type UpdateCommentMutationVariables = {
	input: UpdateCommentInput;
	condition?: ModelCommentConditionInput | null;
};

export type UpdateCommentMutation = {
	updateComment?: {
		__typename: 'Comment';
		id: string;
		owner?: string | null;
		body: string;
		thread: {
			__typename: 'Thread';
			id: string;
			topic?: string | null;
			comments?: {
				__typename: 'ModelCommentConnection';
				nextToken?: string | null;
			} | null;
			createdAt?: string | null;
			updatedAt: string;
			owner?: string | null;
		};
		createdAt?: string | null;
		updatedAt: string;
		threadCommentsId?: string | null;
	} | null;
};

export type DeleteCommentMutationVariables = {
	input: DeleteCommentInput;
	condition?: ModelCommentConditionInput | null;
};

export type DeleteCommentMutation = {
	deleteComment?: {
		__typename: 'Comment';
		id: string;
		owner?: string | null;
		body: string;
		thread: {
			__typename: 'Thread';
			id: string;
			topic?: string | null;
			comments?: {
				__typename: 'ModelCommentConnection';
				nextToken?: string | null;
			} | null;
			createdAt?: string | null;
			updatedAt: string;
			owner?: string | null;
		};
		createdAt?: string | null;
		updatedAt: string;
		threadCommentsId?: string | null;
	} | null;
};

export type GetThreadQueryVariables = {
	id: string;
};

export type GetThreadQuery = {
	getThread?: {
		__typename: 'Thread';
		id: string;
		topic?: string | null;
		comments?: {
			__typename: 'ModelCommentConnection';
			items: Array<{
				__typename: 'Comment';
				id: string;
				owner?: string | null;
				body: string;
				createdAt?: string | null;
				updatedAt: string;
				threadCommentsId?: string | null;
			} | null>;
			nextToken?: string | null;
		} | null;
		createdAt?: string | null;
		updatedAt: string;
		owner?: string | null;
	} | null;
};

export type ListThreadsQueryVariables = {
	filter?: ModelThreadFilterInput | null;
	limit?: number | null;
	nextToken?: string | null;
};

export type ListThreadsQuery = {
	listThreads?: {
		__typename: 'ModelThreadConnection';
		items: Array<{
			__typename: 'Thread';
			id: string;
			topic?: string | null;
			comments?: {
				__typename: 'ModelCommentConnection';
				nextToken?: string | null;
			} | null;
			createdAt?: string | null;
			updatedAt: string;
			owner?: string | null;
		} | null>;
		nextToken?: string | null;
	} | null;
};

export type GetCommentQueryVariables = {
	id: string;
};

export type GetCommentQuery = {
	getComment?: {
		__typename: 'Comment';
		id: string;
		owner?: string | null;
		body: string;
		thread: {
			__typename: 'Thread';
			id: string;
			topic?: string | null;
			comments?: {
				__typename: 'ModelCommentConnection';
				nextToken?: string | null;
			} | null;
			createdAt?: string | null;
			updatedAt: string;
			owner?: string | null;
		};
		createdAt?: string | null;
		updatedAt: string;
		threadCommentsId?: string | null;
	} | null;
};

export type ListCommentsQueryVariables = {
	filter?: ModelCommentFilterInput | null;
	limit?: number | null;
	nextToken?: string | null;
};

export type ListCommentsQuery = {
	listComments?: {
		__typename: 'ModelCommentConnection';
		items: Array<{
			__typename: 'Comment';
			id: string;
			owner?: string | null;
			body: string;
			thread: {
				__typename: 'Thread';
				id: string;
				topic?: string | null;
				createdAt?: string | null;
				updatedAt: string;
				owner?: string | null;
			};
			createdAt?: string | null;
			updatedAt: string;
			threadCommentsId?: string | null;
		} | null>;
		nextToken?: string | null;
	} | null;
};

export type OnCreateThreadSubscriptionVariables = {
	filter?: ModelSubscriptionThreadFilterInput | null;
	owner?: string | null;
};

export type OnCreateThreadSubscription = {
	onCreateThread?: {
		__typename: 'Thread';
		id: string;
		topic?: string | null;
		comments?: {
			__typename: 'ModelCommentConnection';
			items: Array<{
				__typename: 'Comment';
				id: string;
				owner?: string | null;
				body: string;
				createdAt?: string | null;
				updatedAt: string;
				threadCommentsId?: string | null;
			} | null>;
			nextToken?: string | null;
		} | null;
		createdAt?: string | null;
		updatedAt: string;
		owner?: string | null;
	} | null;
};

export type OnUpdateThreadSubscriptionVariables = {
	filter?: ModelSubscriptionThreadFilterInput | null;
	owner?: string | null;
};

export type OnUpdateThreadSubscription = {
	onUpdateThread?: {
		__typename: 'Thread';
		id: string;
		topic?: string | null;
		comments?: {
			__typename: 'ModelCommentConnection';
			items: Array<{
				__typename: 'Comment';
				id: string;
				owner?: string | null;
				body: string;
				createdAt?: string | null;
				updatedAt: string;
				threadCommentsId?: string | null;
			} | null>;
			nextToken?: string | null;
		} | null;
		createdAt?: string | null;
		updatedAt: string;
		owner?: string | null;
	} | null;
};

export type OnDeleteThreadSubscriptionVariables = {
	filter?: ModelSubscriptionThreadFilterInput | null;
	owner?: string | null;
};

export type OnDeleteThreadSubscription = {
	onDeleteThread?: {
		__typename: 'Thread';
		id: string;
		topic?: string | null;
		comments?: {
			__typename: 'ModelCommentConnection';
			items: Array<{
				__typename: 'Comment';
				id: string;
				owner?: string | null;
				body: string;
				createdAt?: string | null;
				updatedAt: string;
				threadCommentsId?: string | null;
			} | null>;
			nextToken?: string | null;
		} | null;
		createdAt?: string | null;
		updatedAt: string;
		owner?: string | null;
	} | null;
};

export type OnCreateCommentSubscriptionVariables = {
	filter?: ModelSubscriptionCommentFilterInput | null;
	owner?: string | null;
};

export type OnCreateCommentSubscription = {
	onCreateComment?: {
		__typename: 'Comment';
		id: string;
		owner?: string | null;
		body: string;
		thread: {
			__typename: 'Thread';
			id: string;
			topic?: string | null;
			comments?: {
				__typename: 'ModelCommentConnection';
				nextToken?: string | null;
			} | null;
			createdAt?: string | null;
			updatedAt: string;
			owner?: string | null;
		};
		createdAt?: string | null;
		updatedAt: string;
		threadCommentsId?: string | null;
	} | null;
};

export type OnUpdateCommentSubscriptionVariables = {
	filter?: ModelSubscriptionCommentFilterInput | null;
	owner?: string | null;
};

export type OnUpdateCommentSubscription = {
	onUpdateComment?: {
		__typename: 'Comment';
		id: string;
		owner?: string | null;
		body: string;
		thread: {
			__typename: 'Thread';
			id: string;
			topic?: string | null;
			comments?: {
				__typename: 'ModelCommentConnection';
				nextToken?: string | null;
			} | null;
			createdAt?: string | null;
			updatedAt: string;
			owner?: string | null;
		};
		createdAt?: string | null;
		updatedAt: string;
		threadCommentsId?: string | null;
	} | null;
};

export type OnDeleteCommentSubscriptionVariables = {
	filter?: ModelSubscriptionCommentFilterInput | null;
	owner?: string | null;
};

export type OnDeleteCommentSubscription = {
	onDeleteComment?: {
		__typename: 'Comment';
		id: string;
		owner?: string | null;
		body: string;
		thread: {
			__typename: 'Thread';
			id: string;
			topic?: string | null;
			comments?: {
				__typename: 'ModelCommentConnection';
				nextToken?: string | null;
			} | null;
			createdAt?: string | null;
			updatedAt: string;
			owner?: string | null;
		};
		createdAt?: string | null;
		updatedAt: string;
		threadCommentsId?: string | null;
	} | null;
};
