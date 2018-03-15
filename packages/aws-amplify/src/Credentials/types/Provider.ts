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
export interface CredentialsProvider {
    // you need to implement those  methods

    // configure your provider
    configure(config: object): Promise<object>;

    // set credential with configuration
    setCredentials(config: object): Promise<any>;

    // get credential with configuration
    getCredentials(config: object): Promise<any>;

    // remove credential with configuration
    removeCredentials(): void;
    
    // return compact version of the credential
    essentialCredentials(params: object): object;

    // return 'Credentials';
    getCategory(): string;
    
    // return the name of you provider
    getProviderName(): string;
}
