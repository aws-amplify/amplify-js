import {
	AdditionalDetails,
	AuthAction,
	Category,
	SetCustomUserAgentInput,
	StorageAction,
} from '../../src/Platform/types';

const MOCK_AUTH_UA_STATE: SetCustomUserAgentInput = {
	category: Category.Auth,
	apis: [AuthAction.ConfirmSignIn, AuthAction.SignIn],
	additionalDetails: [['uastate', 'auth']],
};

const MOCK_STORAGE_UA_STATE: SetCustomUserAgentInput = {
	category: Category.Storage,
	apis: [StorageAction.Copy],
	additionalDetails: [['uastate', 'storage']],
};

describe('Custom user agent utilities', () => {
	let getCustomUserAgent: (
		category: string,
		api: string,
	) => AdditionalDetails | undefined;
	let setCustomUserAgent: (input: SetCustomUserAgentInput) => () => void;

	beforeEach(() => {
		jest.resetModules();
		({ getCustomUserAgent } = require('../../src/Platform/customUserAgent'));
		({ setCustomUserAgent } = require('../../src/Platform/customUserAgent'));
	});

	it('sets custom user agent state for multiple categories and APIs', () => {
		setCustomUserAgent(MOCK_AUTH_UA_STATE);
		setCustomUserAgent(MOCK_STORAGE_UA_STATE);

		const confirmSignInState = getCustomUserAgent(
			Category.Auth,
			AuthAction.ConfirmSignIn,
		);
		const signInState = getCustomUserAgent(Category.Auth, AuthAction.SignIn);
		const copyState = getCustomUserAgent(Category.Storage, StorageAction.Copy);

		expect(copyState).toEqual([['uastate', 'storage']]);
		expect(confirmSignInState).toStrictEqual([['uastate', 'auth']]);
		expect(signInState).toEqual(confirmSignInState);
	});

	it('returns a callback that will clear user agent state', () => {
		const cleanUp = setCustomUserAgent(MOCK_AUTH_UA_STATE);
		const cleanUp2 = setCustomUserAgent(MOCK_AUTH_UA_STATE);
		const cleanUp3 = setCustomUserAgent(MOCK_STORAGE_UA_STATE);

		// Setting state for the same category & API twice should prevent deletion until all references are cleaned up
		cleanUp();
		let confirmSignInState = getCustomUserAgent(
			Category.Auth,
			AuthAction.ConfirmSignIn,
		);
		expect(confirmSignInState).toStrictEqual([['uastate', 'auth']]);

		cleanUp2();
		confirmSignInState = getCustomUserAgent(
			Category.Auth,
			AuthAction.ConfirmSignIn,
		);
		expect(confirmSignInState).toStrictEqual(undefined);

		// Calling the same cleanup callback twice shouldn't result in errors
		cleanUp();

		// Cleaning up shouldn't impact state set in a different call
		let copyState = getCustomUserAgent(Category.Storage, StorageAction.Copy);
		expect(copyState).toEqual([['uastate', 'storage']]);

		cleanUp3();
		copyState = getCustomUserAgent(Category.Storage, StorageAction.Copy);
		expect(copyState).toStrictEqual(undefined);
	});
});
