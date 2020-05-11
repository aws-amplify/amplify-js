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

export type HubCapsule = {
	channel: string;
	payload: HubPayload;
	source: string;
	patternInfo?: string[];
};
export type HubPayload = {
	event: string;
	data?: any;
	message?: string;
};

export type OnStateChangeType = (state: string, data?: any) => void;

export interface ISignUpConfig {
	defaultCountryCode?: string;
	header?: string;
	hideAllDefaults?: boolean;
	hiddenDefaults?: string[];
	signUpFields?: ISignUpField[];
}

export interface ISignUpField {
	label: string;
	key: string;
	required: boolean;
	placeholder?: string;
	type?: string;
	displayOrder: number;
	testID?: string;
	invalid?: boolean;
	custom?: boolean;
}

export type UsernameAttributesType = 'email' | 'phone_number' | 'username';
