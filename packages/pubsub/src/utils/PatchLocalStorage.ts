import { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('PatchLocalStorage');

let error = undefined;

function patchLocalStorage() {
	try {
		console.log('before');
		const x = window['localStorage'];
		console.log('after');
		window.localStorage;
	} catch (e) {
		logger.error(e);
		error = e;
		Object.defineProperty(window, 'localStorage', {
			value: null,
		});
	}
}

export function reinstateLocalStorageError() {
	console.log('Put back?');
	if (error) {
		console.log('Putting it back');
		Object.defineProperty(window, 'localStorage', {
			get: () => {
				throw error;
			},
		});
	}
}

patchLocalStorage();
