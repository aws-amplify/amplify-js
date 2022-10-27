/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { Amplify, ServiceWorker } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import Cache from '@aws-amplify/cache';

/** Always importing Auth when users import Amplify such that
	for unauthenticated access (no sign in and sign up),
	users don't have to import Auth explicitly **/
Amplify.Auth = Auth;
Amplify.Cache = Cache;
Amplify.ServiceWorker = ServiceWorker;

export { Amplify };
