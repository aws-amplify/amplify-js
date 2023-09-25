// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	HttpRequest,
	fetchTransferHandler,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { DocumentType } from '../types';

interface HandlerInput extends Omit<HttpRequest, 'body'> {
	body: DocumentType | FormData;
}

export const handle = async (amplify: AmplifyClassV6, input: HandlerInput) => {
	const config = amplify.getConfig();
};
