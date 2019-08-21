/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { DocumentNode } from 'graphql/language/ast';
import { ResponseType } from 'axios';

/**
* AWS credentials needed for RestClient
*/
export class AWSCredentials {
    /**
    * Secret Access Key
    *
    * [Access Key ID and Secret Access Key]
    * (http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)
    */
    secretAccessKey: string;

    /**
    * Access Key ID
    *
    * [Access Key ID and Secret Access Key]
    * (http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)
    */
    accessKeyId: string;

    /** Access Token of current session */
    sessionToken: string;
}

// TODO: remove this once unauth creds are figured out
export interface RestClientOptions {
    /** Additional headers for all requests send by this client. e.g. user-agent */
    headers?: object;
    endpoints?: object;
    /** AWS credentials */
    credentials?: object;
}

export interface GraphQLOptions<Variables = object> {
    query: string | DocumentNode,
    variables?: Variables,
    authMode?: GRAPHQL_AUTH_MODE,
}

export enum GRAPHQL_AUTH_MODE {
    API_KEY = "API_KEY",
    AWS_IAM = "AWS_IAM",
    OPENID_CONNECT = "OPENID_CONNECT",
    AMAZON_COGNITO_USER_POOLS = "AMAZON_COGNITO_USER_POOLS",
}

export interface GraphQLResult<Output = {}> {
    data?: Output,
    errors?: [object],
    extensions?: { [key: string]: any },
}

interface APIClassOptionsAPI {
    region?: string;
    header?: {};
    aws_cloud_logic_custom?: {
        id: string;
        name: string;
        description: string;
        endpoint: string;
        region: string;
        paths: string[];
    }[];
    aws_project_region?: string;
    graphql_endpoint?: string;
    graphql_headers?: ({ query, variables }:{ query: string, variables: {} }) => Promise<{
        [customHeaderKey:string]: string
    }>;
    graphql_endpoint_iam_region?: string;
    endpoints?: {
        name: string;
        endpoint: string;
        service?: string;
        region?: string;
        custom_header?: () => { [key:string]: string };
    }[]
}
export interface APIClassOptions extends APIClassOptionsAPI {
    aws_project_region?: string;
    aws_appsync_graphqlEndpoint?: string;
    aws_appsync_region?: string;
    aws_appsync_authenticationType?: string;
    aws_appsync_apiKey?: string;
    API?: APIClassOptionsAPI
    headers?: {};
    body?: {};
}

export interface RestRequestExtraParams {
    headers?: {};
    response?: any;
    body?: {};
    responseType?: ResponseType;
    timeout?: number;
    signerServiceInfo?: {
        service: string;
        region: string;
    };
    queryStringParameters?: {};
}
export interface RestRequestExtraParamsWithResponse extends RestRequestExtraParams {
    response: any;
}
