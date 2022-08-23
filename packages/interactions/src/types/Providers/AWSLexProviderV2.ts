/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
export interface AWSLexProviderV2Option {
	name: string;
	botId: string;
	aliasId: string;
	localeId: string;
	region: string;
	providerName: string;
	onComplete?(botname: string, callback: (err, confirmation) => void): void;
}

export interface AWSLexProviderV2Options {
	[key: string]: AWSLexProviderV2Option;
}
