/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

type GeneratedMutation<InputType, OutputType> = string & {
	__generatedMutationInput: InputType;
	__generatedMutationOutput: OutputType;
};
import * as APITypes from './API';

export const createThread = /* GraphQL */ `
  mutation CreateThread(
    $input: CreateThreadInput!
    $condition: ModelThreadConditionInput
  ) {
    createThread(input: $input, condition: $condition) {
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
` as GeneratedMutation<
	APITypes.CreateThreadMutationVariables,
	APITypes.CreateThreadMutation
>;

export const updateThread = /* GraphQL */ `
  mutation UpdateThread(
    $input: UpdateThreadInput!
    $condition: ModelThreadConditionInput
  ) {
    updateThread(input: $input, condition: $condition) {
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
` as GeneratedMutation<
	APITypes.UpdateThreadMutationVariables,
	APITypes.UpdateThreadMutation
>;

export const deleteThread = /* GraphQL */ `
  mutation DeleteThread(
    $input: DeleteThreadInput!
    $condition: ModelThreadConditionInput
  ) {
    deleteThread(input: $input, condition: $condition) {
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
` as GeneratedMutation<
	APITypes.DeleteThreadMutationVariables,
	APITypes.DeleteThreadMutation
>;
