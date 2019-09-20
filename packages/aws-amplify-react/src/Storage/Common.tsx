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

export function calcKey(file, fileToKey) {
	const { name, size, type } = file;
	let key = encodeURI(name);
	if (fileToKey) {
		const callback_type = typeof fileToKey;
		if (callback_type === 'string') {
			key = fileToKey;
		} else if (callback_type === 'function') {
			key = fileToKey({ name, size, type });
		} else {
			key = encodeURI(JSON.stringify(fileToKey));
		}
		if (!key) {
			key = 'empty_key';
		}
	}

	return key.replace(/\s/g, '_');
}
