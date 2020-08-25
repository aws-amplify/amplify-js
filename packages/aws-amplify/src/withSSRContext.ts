import { AmplifyClass, JS, UniversalStorage } from '@aws-amplify/core';
import {
	PersistentModel,
	PersistentModelConstructor,
} from '@aws-amplify/datastore';
import { NextPageContext } from 'next';

// ! We have to use this exact reference, since it gets mutated with Amplify.Auth
import { Amplify } from './index';

const { isBrowser } = JS.browserOrNode();

// Helper for converting JSON back into DataStore models (while respecting IDs)
function deserializeModel<T extends PersistentModel>(
	model: PersistentModelConstructor<T>,
	init: T | T[]
) {
	if (Array.isArray(init)) {
		return init.map(init => deserializeModel(model, init));
	}

	// `fromJSON` is intentionally hidden from types as a "private" method (though it exists on the instance)
	// @ts-ignore Property 'fromJSON' does not exist on type 'PersistentModelConstructor<T>'.ts(2339)
	return model.fromJSON(init);
}

// Helper for converting DataStore models to JSON
function serializeModel<T extends PersistentModel>(model: T | T[]): JSON {
	return JSON.parse(JSON.stringify(model));
}

export function withSSRContext(context?: Pick<NextPageContext, 'req'>) {
	const previousConfig = Amplify.configure();
	const amplify = new AmplifyClass();
	const storage = new UniversalStorage(context);

	// Replace Auth singleton's existing Storage with UniversalStorage, since UI components reference category singletons
	if (isBrowser) {
		Amplify.configure({ storage });
	}

	const previousModules = Object.keys(Amplify)
		.map(
			property =>
				Amplify[property] &&
				Amplify[property].getModuleName &&
				Amplify[property]
		)
		.filter(Boolean);

	previousModules
		.map(module => {
			switch (module.getModuleName()) {
				// Modules that have been tested with SSR and confirmed to require instanced Credentials
				case 'API':
				case 'Auth':
				case 'DataStore':
				case 'GraphQLAPI':
				case 'RestAPI':
					return new module.constructor();

				// Modules that a static reference is safe to use, without need for new Credentials.
				case 'I18n':

				// Modules that haven't been tested with SSR
				case 'Analytics':
				case 'PubSub':
				case 'Predictions':

				// Any other module on Amplify.* stays the same
				default:
					return module;
			}
		})
		.forEach(instance => {
			// Ensure this instance of Amplify is associated with new instances of categories
			amplify.register(instance);
		});

	// Configure new Amplify instances with previous configuration
	amplify.configure({ ...previousConfig, storage });

	return {
		...amplify,
		deserializeModel,
		serializeModel,
	};
}
