import {
	AmplifyClass,
	CredentialsClass,
	UniversalStorage,
} from '@aws-amplify/core';
import { NextPageContext } from 'next';

// ! We have to use this exact reference, since it gets mutated with Amplify.Auth
import { Amplify } from './index';

export function withSSRContext(context?: Pick<NextPageContext, 'req'>) {
	const previousConfig = Amplify.configure();
	const amplify = new AmplifyClass();
	const Credentials = new CredentialsClass(null);
	const storage = new UniversalStorage(context);

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
				case 'API':
				case 'Auth':
				case 'DataStore':
					return new module.constructor();

				default:
					return module;
			}
		})
		.forEach(instance => {
			// Dependency Injection via property-setting.
			// This avoids introducing a public method/interface/setter that's difficult to remove later.
			// Plus, it reduces `if` statements within the `constructor` and `configure`
			if (instance.hasOwnProperty('Credentials')) {
				instance.Credentials = Credentials;
			}

			amplify.register(instance);
		});

	amplify.configure({ ...previousConfig, Credentials, storage });

	return amplify;
}
