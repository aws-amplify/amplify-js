/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from './API';
type GeneratedMutation<InputType, OutputType> = string & {
	__generatedMutationInput: InputType;
	__generatedMutationOutput: OutputType;
};

export const createThread = /* GraphQL */ `mutation CreateThread(
  $input: CreateThreadInput!
  $condition: ModelThreadConditionInput
) {
  createThread(input: $input, condition: $condition) {
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
` as GeneratedMutation<
	APITypes.CreateThreadMutationVariables,
	APITypes.CreateThreadMutation
>;
export const updateThread = /* GraphQL */ `mutation UpdateThread(
  $input: UpdateThreadInput!
  $condition: ModelThreadConditionInput
) {
  updateThread(input: $input, condition: $condition) {
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
` as GeneratedMutation<
	APITypes.UpdateThreadMutationVariables,
	APITypes.UpdateThreadMutation
>;
export const deleteThread = /* GraphQL */ `mutation DeleteThread(
  $input: DeleteThreadInput!
  $condition: ModelThreadConditionInput
) {
  deleteThread(input: $input, condition: $condition) {
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
` as GeneratedMutation<
	APITypes.DeleteThreadMutationVariables,
	APITypes.DeleteThreadMutation
>;
export const createComment = /* GraphQL */ `mutation CreateComment(
  $input: CreateCommentInput!
  $condition: ModelCommentConditionInput
) {
  createComment(input: $input, condition: $condition) {
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
` as GeneratedMutation<
	APITypes.CreateCommentMutationVariables,
	APITypes.CreateCommentMutation
>;
export const updateComment = /* GraphQL */ `mutation UpdateComment(
  $input: UpdateCommentInput!
  $condition: ModelCommentConditionInput
) {
  updateComment(input: $input, condition: $condition) {
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
` as GeneratedMutation<
	APITypes.UpdateCommentMutationVariables,
	APITypes.UpdateCommentMutation
>;
export const deleteComment = /* GraphQL */ `mutation DeleteComment(
  $input: DeleteCommentInput!
  $condition: ModelCommentConditionInput
) {
  deleteComment(input: $input, condition: $condition) {
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
` as GeneratedMutation<
	APITypes.DeleteCommentMutationVariables,
	APITypes.DeleteCommentMutation
>;
