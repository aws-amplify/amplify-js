// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { API } from '@aws-amplify/api';
import { InternalAPI } from '@aws-amplify/api/internals';
import { Auth } from '@aws-amplify/auth';
import { AuthClass, InternalAuthClass } from '@aws-amplify/auth/internals';
import { AmplifyClass, Credentials, UniversalStorage } from '@aws-amplify/core';
import { DataStore } from '@aws-amplify/datastore';

// ! We have to use this exact reference, since it gets mutated with Amplify.Auth
import { Amplify } from './index';

// Auth and InternalAuth are required, but cannot be instanciated in a standard way
const requiredModules = [
	// Auth cannot function without Credentials
	Credentials,
];

// These modules have been tested with SSR
const defaultModules = [API, Auth, DataStore];

type Context = {
	req?: any;
	modules?: any[];
};

export function withSSRContext(context: Context = {}) {
	const { modules = defaultModules, req } = context;
	if (modules.includes(DataStore)) {
		modules.push(InternalAPI);
	}

	const previousConfig = Amplify.configure();
	const amplify = new AmplifyClass();
	const storage = new UniversalStorage({ req });

	// Always instanciate Auth/InternalAuth
	// Auth and InternalAuth are constructed differently than other modules
	const SSRInternalAuth = new InternalAuthClass();
	amplify.register(new AuthClass(SSRInternalAuth));
	// Manually add InternalAuth to Amplify _modules for dependency injection
	// Avoids duplicate configure calls to InternalAuth as it is configured through Auth
	amplify['_modules']['InternalAuth'] = SSRInternalAuth;

	requiredModules.forEach(m => {
		if (!modules.includes(m)) {
			// @ts-ignore This expression is not constructable.
			// Type 'Function' has no construct signatures.ts(2351)
			amplify.register(new m.constructor());
		}
	});

	// Associate new module instances with this amplify
	modules.forEach(m => {
		if (m !== Auth) {
			amplify.register(new m.constructor());
		}
	});

	// Configure new Amplify instances with previous configuration
	amplify.configure({ ...previousConfig, storage });

	// Add InternalAuth to Amplify instance after config to avoid duplicate config calls
	amplify['InternalAuth'] = SSRInternalAuth;

	return amplify;
}
