import Client from '../src/Client';
import AuthenticationHelper from '../src/AuthenticationHelper';
import {
	networkError,
	getSalt,
	getVerifiers,
	genHashDevices,
} from '../__tests__/constants';

/**
 *
 * @param {boolean} success defines if a network request is successful
 * @param {object?} optional data to return onSuccess, some tests requires specific object values
 */
export function netRequestMockSuccess(success, data = {}) {
	if (success) {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](null, data);
			});
	} else {
		jest
			.spyOn(Client.prototype, 'request')
			.mockImplementationOnce((...args) => {
				args[2](networkError, null);
			});
	}
}

/**
 *
 * @param {string} fnName function name within the AuthenticationHelper class
 * @returns mockImplemntation of the fnName or throw error
 */
export function authHelperMock(fnName) {
	const fnNames = Object.getOwnPropertyNames(AuthenticationHelper.prototype);
	if (fnNames.indexOf(fnName) < 0) {
		throw new Error(
			`${fnName} provided does not exist in Authentication Helper class`
		);
	}
	if (fnName === genHashDevices) {
		jest
			.spyOn(AuthenticationHelper.prototype, fnName)
			.mockImplementationOnce((...args) => {
				args[2](null, null);
			});
	} else if (fnName === getSalt || fnName === getVerifiers) {
		jest
			.spyOn(AuthenticationHelper.prototype, fnName)
			.mockImplementationOnce(() => {
				return 'deadbeef';
			});
	}
}
