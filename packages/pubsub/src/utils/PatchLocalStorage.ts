import { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('PatchLocalStorage');

let error = undefined;

function patchLocalStorage() {
	try {
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
	if (error) {
		Object.defineProperty(window, 'localStorage', {
			get: () => {
				throw error;
			},
		});
	}
}

patchLocalStorage();
