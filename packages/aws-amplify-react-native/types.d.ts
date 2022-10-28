// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
