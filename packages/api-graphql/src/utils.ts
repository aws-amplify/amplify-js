import { Amplify, Credentials } from '@aws-amplify/core';
import { RestClient } from '@aws-amplify/api-rest';

// Constants
export const USER_AGENT_HEADER = 'x-amz-user-agent';

// Instantiate a REST client for GraphQL commands to use internally
const restClient = new RestClient(Amplify.getConfig());
restClient.Credentials = Credentials;
export { restClient };
