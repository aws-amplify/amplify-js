/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from './API';
type GeneratedSubscription<InputType, OutputType> = string & {
	__generatedSubscriptionInput: InputType;
	__generatedSubscriptionOutput: OutputType;
};

export const onCreateThread = /* GraphQL */ `subscription OnCreateThread(
  $filter: ModelSubscriptionThreadFilterInput
  $owner: String
) {
  onCreateThread(filter: $filter, owner: $owner) {
    id
    topic
    comments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnCreateThreadSubscriptionVariables,
	APITypes.OnCreateThreadSubscription
>;
export const onUpdateThread = /* GraphQL */ `subscription OnUpdateThread(
  $filter: ModelSubscriptionThreadFilterInput
  $owner: String
) {
  onUpdateThread(filter: $filter, owner: $owner) {
    id
    topic
    comments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnUpdateThreadSubscriptionVariables,
	APITypes.OnUpdateThreadSubscription
>;
export const onDeleteThread = /* GraphQL */ `subscription OnDeleteThread(
  $filter: ModelSubscriptionThreadFilterInput
  $owner: String
) {
  onDeleteThread(filter: $filter, owner: $owner) {
    id
    topic
    comments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnDeleteThreadSubscriptionVariables,
	APITypes.OnDeleteThreadSubscription
>;
export const onCreateComment = /* GraphQL */ `subscription OnCreateComment(
  $filter: ModelSubscriptionCommentFilterInput
  $owner: String
) {
  onCreateComment(filter: $filter, owner: $owner) {
    id
    owner
    body
    thread {
      id
      topic
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    threadCommentsId
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnCreateCommentSubscriptionVariables,
	APITypes.OnCreateCommentSubscription
>;
export const onUpdateComment = /* GraphQL */ `subscription OnUpdateComment(
  $filter: ModelSubscriptionCommentFilterInput
  $owner: String
) {
  onUpdateComment(filter: $filter, owner: $owner) {
    id
    owner
    body
    thread {
      id
      topic
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    threadCommentsId
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnUpdateCommentSubscriptionVariables,
	APITypes.OnUpdateCommentSubscription
>;
export const onDeleteComment = /* GraphQL */ `subscription OnDeleteComment(
  $filter: ModelSubscriptionCommentFilterInput
  $owner: String
) {
  onDeleteComment(filter: $filter, owner: $owner) {
    id
    owner
    body
    thread {
      id
      topic
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    threadCommentsId
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnDeleteCommentSubscriptionVariables,
	APITypes.OnDeleteCommentSubscription
>;
