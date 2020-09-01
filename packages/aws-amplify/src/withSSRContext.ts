import API from '@aws-amplify/api';
import { Auth } from '@aws-amplify/auth';
import { Credentials } from '@aws-amplify/core';
import {
	AmplifyClass,
	browserOrNode,
	UniversalStorage,
} from '@aws-amplify/core';

import {
	DataStore,
	PersistentModel,
	PersistentModelConstructor,
} from '@aws-amplify/datastore';
import { NextPageContext } from 'next';

// ! We have to use this exact reference, since it gets mutated with Amplify.Auth
import { Amplify } from './index';

const { isBrowser } = browserOrNode();

const requiredModules = [
	// API cannot function without Auth
	Auth,
	// Auth cannot function without Credentials
	Credentials,
];

// These modules have been tested with SSR
const defaultModules = [API, Auth, DataStore];

// Helper for converting JSON back into DataStore models (while respecting IDs)
function deserializeModel<T extends PersistentModel>(
	Model: PersistentModelConstructor<T>,
	init: T | T[]
) {
	if (Array.isArray(init)) {
		return init.map(init => deserializeModel(Model, init));
	}

	// `fromJSON` is intentionally hidden from types as a "private" method (though it exists on the instance)
	// @ts-ignore Property 'fromJSON' does not exist on type 'PersistentModelConstructor<T>'.ts(2339)
	return Model.fromJSON(init);
}

// Helper for converting DataStore models to JSON
function serializeModel<T extends PersistentModel>(model: T | T[]): JSON {
	return JSON.parse(JSON.stringify(model));
}

type Context = Pick<NextPageContext, 'req'> & {
	modules?: any[];
};

export function withSSRContext(context: Context = {}) {
	const { modules = defaultModules, req } = context;
	const previousConfig = Amplify.configure();
	const amplify = new AmplifyClass();
	const storage = new UniversalStorage({ req });

	// Replace Auth singleton's existing Storage with UniversalStorage, since UI components reference category singletons
	if (isBrowser) {
		Amplify.configure({ storage });
	}

	requiredModules.forEach(m => {
		if (!modules.includes(m)) {
			// @ts-ignore This expression is not constructable.
			// Type 'Function' has no construct signatures.ts(2351)
			amplify.register(new m.constructor());
		}
	});

	// Associate new module instances with this amplify
	modules.forEach(m => {
		amplify.register(new m.constructor());
	});

	// Configure new Amplify instances with previous configuration
	amplify.configure({ ...previousConfig, storage });

	return {
		...amplify,
		deserializeModel,
		serializeModel,
	};
}
