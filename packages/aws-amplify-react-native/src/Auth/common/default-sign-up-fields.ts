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

import TEST_ID from '../../AmplifyTestIDs';
import { ISignUpField } from '../../../types';

export default [
	{
		label: 'Username',
		key: 'username',
		required: true,
		placeholder: 'Username',
		displayOrder: 1,
		testID: TEST_ID.AUTH.USERNAME_INPUT,
	},
	{
		label: 'Password',
		key: 'password',
		required: true,
		placeholder: 'Password',
		type: 'password',
		displayOrder: 2,
		testID: TEST_ID.AUTH.PASSWORD_INPUT,
	},
	{
		label: 'Email',
		key: 'email',
		required: true,
		placeholder: 'Email',
		type: 'email',
		displayOrder: 3,
		testID: TEST_ID.AUTH.EMAIL_INPUT,
	},
	{
		label: 'Phone Number',
		key: 'phone_number',
		placeholder: 'Phone Number',
		required: true,
		displayOrder: 4,
		testID: TEST_ID.AUTH.PHONE_INPUT,
	},
];

export const signUpWithEmailFields: ISignUpField[] = [
	{
		label: 'Email',
		key: 'email',
		required: true,
		placeholder: 'Email',
		type: 'email',
		displayOrder: 1,
		testID: TEST_ID.AUTH.EMAIL_INPUT,
	},
	{
		label: 'Password',
		key: 'password',
		required: true,
		placeholder: 'Password',
		type: 'password',
		displayOrder: 2,
		testID: TEST_ID.AUTH.PASSWORD_INPUT,
	},
	{
		label: 'Phone Number',
		key: 'phone_number',
		placeholder: 'Phone Number',
		required: true,
		displayOrder: 3,
		testID: TEST_ID.AUTH.PHONE_INPUT,
	},
];

export const signUpWithPhoneNumberFields: ISignUpField[] = [
	{
		label: 'Phone Number',
		key: 'phone_number',
		placeholder: 'Phone Number',
		required: true,
		displayOrder: 1,
		testID: TEST_ID.AUTH.PHONE_INPUT,
	},
	{
		label: 'Password',
		key: 'password',
		required: true,
		placeholder: 'Password',
		type: 'password',
		displayOrder: 2,
		testID: TEST_ID.AUTH.PASSWORD_INPUT,
	},
	{
		label: 'Email',
		key: 'email',
		required: true,
		placeholder: 'Email',
		type: 'email',
		displayOrder: 3,
		testID: TEST_ID.AUTH.EMAIL_INPUT,
	},
];
