import { AmplifyClass, UniversalStorage } from '@aws-amplify/core';
import { NextPageContext } from 'next';

// ! We have to use this exact reference, since it gets mutated with Amplify.Auth
import { Amplify } from './index';

export function withServerContext(context?: Pick<NextPageContext, 'req'>) {
	const previousConfig = Amplify.configure();
	const amplify = new AmplifyClass();
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
			amplify.register(instance);
		});

	amplify.configure({
		...previousConfig,
		storage: new UniversalStorage(context),
	});

	return amplify;
}
