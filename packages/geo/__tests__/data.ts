/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
export const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

export const awsConfig = {
	geo: {
		maps: {
			items: {
				geoJsExampleMap1: {
					style: 'VectorEsriStreets',
				},
				geoJsExampleMap2: {
					style: 'VectorEsriTopographic',
				},
			},
			default: 'geoJsExampleMap1',
		},
		place_indexes: {
			items: ['geoJSSearchExample'],
			default: 'geoJSSearchExample',
		},
		region: 'us-west-2',
	},
	credentials,
};
