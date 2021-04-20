import CognitoUserSession from '../src/CognitoUserSession';
import {
	ivCognitoUserSession,
	ivRefreshToken,
	ivAccessToken,
	ivCognitoIdToken,
	ivRefreshToken,
} from './constants.js';

describe('Getters for Cognito User Session', () => {
	test('Getting access token', () => {
		expect(ivCognitoUserSession.getIdToken()).toBe(ivCognitoIdToken);
	});

	test('Getting refresh token', () => {
		expect(ivCognitoUserSession.getRefreshToken()).toBe(ivRefreshToken);
	});

	test('Getting access token', () => {
		expect(ivCognitoUserSession.getAccessToken()).toBe(ivAccessToken);
	});

	test('Access token undefined', () => {
		expect(() => {
			new CognitoUserSession({
				IdToken: ivCognitoIdToken,
				RefreshToken: ivRefreshToken,
				AccessToken: null,
				ClockDrift: undefined,
			});
		}).toThrowError('Id token and Access Token must be present.');
	});
});

describe('Calculations for Cognito User Attributes', () => {
	test('Calculate a clock drift to be the difference from now and the min of idToken and access token', () => {
		const currDate = Math.floor(new Date() / 1000);
		const idToken = ivCognitoUserSession.getIdToken().getIssuedAt();
		const accessToken = ivCognitoUserSession.getAccessToken().getIssuedAt();
		const min = Math.min(idToken, accessToken);
		const expectedValue = currDate - min;

		expect(ivCognitoUserSession.calculateClockDrift()).toBe(expectedValue);
	});

	test('Getting undefined clock drift', () => {
		expect(ivCognitoUserSession.getClockDrift()).toEqual(
			ivCognitoUserSession.calculateClockDrift()
		);
	});

	test('JWT Expiration was hard-coded to be a time in the past so that this is guaranteed to be an invalid token', () => {
		expect(ivCognitoUserSession.isValid()).toBe(false);
	});
});
