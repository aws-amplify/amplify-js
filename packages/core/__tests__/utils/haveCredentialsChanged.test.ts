import { haveCredentialsChanged } from '../../src/utils/haveCredentialsChanged';

const MOCK_AWS_CREDS = {
	accessKeyId: 'mock-access-key',
	secretAccessKey: 'mock-secret-key',
	sessionToken: 'mock-session-token',
};

describe('haveCredentialsChanged', () => {
	it('returns true if access key has changed', () => {
		const credentialsHaveChanged = haveCredentialsChanged(MOCK_AWS_CREDS, {
			...MOCK_AWS_CREDS,
			secretAccessKey: 'mock-secret-key-alt',
		});

		expect(credentialsHaveChanged).toBe(true);
	});

	it('returns true if access key has changed', () => {
		const credentialsHaveChanged = haveCredentialsChanged(MOCK_AWS_CREDS, {
			...MOCK_AWS_CREDS,
			accessKeyId: 'mock-access-key-alt',
		});

		expect(credentialsHaveChanged).toBe(true);
	});

	it('returns true if session token has changed', () => {
		const credentialsHaveChanged = haveCredentialsChanged(MOCK_AWS_CREDS, {
			...MOCK_AWS_CREDS,
			sessionToken: 'mock-session-token-alt',
		});

		expect(credentialsHaveChanged).toBe(true);
	});

	it('returns false if credentials have not changed', () => {
		const credentialsHaveChanged = haveCredentialsChanged(
			MOCK_AWS_CREDS,
			MOCK_AWS_CREDS,
		);

		expect(credentialsHaveChanged).toBe(false);
	});
});
