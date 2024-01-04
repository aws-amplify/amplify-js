// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession as fetchAuthSessionInternal } from './internal/fetchAuthSession';
import { Amplify } from '../Amplify';
import { AuthSession, FetchAuthSessionOptions } from '../Auth/types';

let inflightAuthSessionPromise: Promise<AuthSession>;
let inflightAuthSessionPromiseCounter = 0;

async function debouncedFetchAuhtSession(
	options?: FetchAuthSessionOptions
): Promise<AuthSession> {
	if (inflightAuthSessionPromiseCounter === 0) {
		inflightAuthSessionPromise = new Promise(async (resolve, reject) => {
			try {
				const session = await fetchAuthSessionInternal(Amplify, options);
				resolve(session);
			} catch (error) {
				reject(error);
			}
		});
	}
	inflightAuthSessionPromiseCounter++;
	try {
		return await inflightAuthSessionPromise;
	} finally {
		inflightAuthSessionPromiseCounter--;
	}
}

export const fetchAuthSession = (
	options?: FetchAuthSessionOptions
): Promise<AuthSession> => {
	return debouncedFetchAuhtSession(options)
};
