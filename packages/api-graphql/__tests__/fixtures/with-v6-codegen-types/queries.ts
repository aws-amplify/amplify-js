/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from './API';
type GeneratedQuery<InputType, OutputType> = string & {
	__generatedQueryInput: InputType;
	__generatedQueryOutput: OutputType;
};

export const getThread = /* GraphQL */ `query GetThread($id: ID!) {
  getThread(id: $id) {
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
` as GeneratedQuery<APITypes.GetThreadQueryVariables, APITypes.GetThreadQuery>;
export const listThreads = /* GraphQL */ `query ListThreads(
  $filter: ModelThreadFilterInput
  $limit: Int
  $nextToken: String
) {
  listThreads(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      topic
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
	APITypes.ListThreadsQueryVariables,
	APITypes.ListThreadsQuery
>;
export const getComment = /* GraphQL */ `query GetComment($id: ID!) {
  getComment(id: $id) {
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
` as GeneratedQuery<
	APITypes.GetCommentQueryVariables,
	APITypes.GetCommentQuery
>;
export const listComments = /* GraphQL */ `query ListComments(
  $filter: ModelCommentFilterInput
  $limit: Int
  $nextToken: String
) {
  listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      owner
      body
      createdAt
      updatedAt
      threadCommentsId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
	APITypes.ListCommentsQueryVariables,
	APITypes.ListCommentsQuery
>;
