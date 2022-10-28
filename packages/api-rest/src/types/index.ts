// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	sessionToken: string;
}

// TODO: remove this once unauth creds are figured out
export interface apiOptions {
	headers: object;
	endpoints: object;
	credentials?: object;
}

export type ApiInfo = {
	endpoint: string;
	region?: string;
	service?: string;
	custom_header?: () => { [key: string]: string };
};
