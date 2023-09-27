/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from './API';

type GeneratedQuery<InputType, OutputType> = string & {
	__generatedQueryInput: InputType;
	__generatedQueryOutput: OutputType;
};

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
` as GeneratedQuery<APITypes.GetThreadQueryVariables, APITypes.GetThreadQuery>;

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
` as GeneratedQuery<
	APITypes.ListThreadsQueryVariables,
	APITypes.ListThreadsQuery
>;
