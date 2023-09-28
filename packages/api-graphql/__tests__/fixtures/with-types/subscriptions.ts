/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

type GeneratedSubscription<InputType, OutputType> = string & {
	__generatedSubscriptionInput: InputType;
	__generatedSubscriptionOutput: OutputType;
};
import * as APITypes from './API';

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
` as GeneratedSubscription<
	APITypes.OnCreateThreadSubscriptionVariables,
	APITypes.OnCreateThreadSubscription
>;

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
` as GeneratedSubscription<
	APITypes.OnUpdateThreadSubscriptionVariables,
	APITypes.OnUpdateThreadSubscription
>;

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
` as GeneratedSubscription<
	APITypes.OnDeleteThreadSubscriptionVariables,
	APITypes.OnDeleteThreadSubscription
>;
