// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	FormattedDates,
	SignRequestOptions,
} from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/types/signer';
import { Credentials } from '../../../../../../../src/clients/types';

export const credentials: Credentials = {
	accessKeyId: 'access-key-id',
	secretAccessKey: 'secret-access-key',
};

export const credentialsWithToken: Credentials = {
	...credentials,
	sessionToken: 'session-token',
};

export const url = 'https://domain.fakeurl/';

export const signingDate = new Date('2020-09-18T18:18:18.808Z');

export const signingRegion = 'signing-region';

export const signingService = 'signing-service';

export const signingOptions: SignRequestOptions = {
	credentials,
	signingDate,
	signingRegion,
	signingService,
};

export const formattedDates: FormattedDates = {
	longDate: '20200918T181818Z',
	shortDate: '20200918',
};

export const credentialScope =
	'20200918/signing-region/signing-service/aws4_request';

export const getDefaultRequest = () => ({
	headers: {},
	method: 'GET',
	url: new URL(url),
});
