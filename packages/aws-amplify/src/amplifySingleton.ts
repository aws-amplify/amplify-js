// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, ServiceWorker } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import { Cache } from '@aws-amplify/cache';

/** Always importing Auth when users import Amplify such that
	for unauthenticated access (no sign in and sign up),
	users don't have to import Auth explicitly **/
Amplify.Auth = Auth;
Amplify.Cache = Cache;
Amplify.ServiceWorker = ServiceWorker;

export { Amplify };
