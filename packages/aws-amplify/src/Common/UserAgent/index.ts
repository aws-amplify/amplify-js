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
let UserAgent:string = 'aws-amplify/0.1.x js';
if (navigator && navigator.product) {
	switch(navigator.product) {
		case 'ReactNative':
			UserAgent = 'aws-amplify/0.1.x react-native';
			break;
		default:
			UserAgent = 'aws-amplify/0.1.x js';
			break;
	}
}
export default UserAgent;