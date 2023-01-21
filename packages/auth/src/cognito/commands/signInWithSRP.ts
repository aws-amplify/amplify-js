import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoUserPool } from '../client';
import { cacheTokens } from '../storage';
import BigInteger from '../utils/BigInteger';
import { Sha256 } from '@aws-crypto/sha256-js';
import {
	_encodeBase64Bytes,
	_urlB64ToUint8Array,
	getNowString,
} from '../utils/AuthUtils';
import AuthenticationHelper from '../utils/AuthenticationHelper';

export async function signInWithSRP({ username, password }) {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	if (amplifyConfig && amplifyConfig.Auth) {
		const clientId = amplifyConfig.Auth.userPoolWebClientId;
		const userPoolId = amplifyConfig.Auth.userPoolId;
		const userPoolName = userPoolId.split('_')[1];
		const authenticationHelper = new AuthenticationHelper(userPoolName);

		const jsonReq = {
			ClientId: clientId,
			AuthFlow: 'USER_SRP_AUTH',
			AuthParameters: {
				USERNAME: username,
				SRP_A: ((await getLargeAValue(authenticationHelper)) as any).toString(
					16
				),
			},
		};

		const responseFromInitiateAuth = await requestCognitoUserPool({
			operation: 'InitiateAuth',
			region: amplifyConfig.Auth.region,
			params: jsonReq,
		});

		const { ChallengeParameters: challengeParameters } =
			responseFromInitiateAuth;

		const serverBValue = new BigInteger(challengeParameters.SRP_B, 16);
		const salt = new BigInteger(challengeParameters.SALT, 16);

		const hkdf = (await getPasswordAuthenticationKey({
			authenticationHelper,
			username,
			password,
			serverBValue,
			salt,
		})) as any;

		const dateNow = getNowString();

		const challengeResponses = {} as any;

		challengeResponses.USERNAME = username;
		challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK =
			challengeParameters.SECRET_BLOCK;
		challengeResponses.TIMESTAMP = dateNow;
		challengeResponses.PASSWORD_CLAIM_SIGNATURE = getSignatureString({
			username,
			userPoolName,
			challengeParameters,
			dateNow,
			hkdf,
		});

		const jsonReqResponseChallenge = {
			ChallengeName: 'PASSWORD_VERIFIER',
			ClientId: clientId,
			ChallengeResponses: challengeResponses,
			ClientMetadata: {},
		};

		const { AuthenticationResult } = await requestCognitoUserPool({
			operation: 'RespondToAuthChallenge',
			region: amplifyConfig.Auth.region,
			params: jsonReqResponseChallenge,
		});

		cacheTokens({
			idToken: AuthenticationResult.IdToken,
			accessToken: AuthenticationResult.AccessToken,
			clockDrift: 0,
			refreshToken: AuthenticationResult.RefreshToken,
			username: 'username',
			userPoolClientID: clientId,
		});

		Amplify.setUser({
			idToken: AuthenticationResult.IdToken,
			accessToken: AuthenticationResult.AccessToken,
			isSignedIn: true,
			refreshToken: AuthenticationResult.RefreshToken,
		});

		return {
			accessToken: AuthenticationResult.AccessToken,
			idToken: AuthenticationResult.IdToken,
			refreshToken: AuthenticationResult.RefreshToken,
		};
	}
}

function getSignatureString({
	userPoolName,
	username,
	challengeParameters,
	dateNow,
	hkdf,
}) {
	const encoder = new TextEncoder();

	const bufUPIDaToB = encoder.encode(userPoolName);
	const bufUNaToB = encoder.encode(username);
	const bufSBaToB = _urlB64ToUint8Array(challengeParameters.SECRET_BLOCK);
	const bufDNaToB = encoder.encode(dateNow);

	const bufConcat = new Uint8Array(
		bufUPIDaToB.byteLength +
			bufUNaToB.byteLength +
			bufSBaToB.byteLength +
			bufDNaToB.byteLength
	);
	bufConcat.set(bufUPIDaToB, 0);
	bufConcat.set(bufUNaToB, bufUPIDaToB.byteLength);
	bufConcat.set(bufSBaToB, bufUPIDaToB.byteLength + bufUNaToB.byteLength);
	bufConcat.set(
		bufDNaToB,
		bufUPIDaToB.byteLength + bufUNaToB.byteLength + bufSBaToB.byteLength
	);

	const awsCryptoHash = new Sha256(hkdf);
	awsCryptoHash.update(bufConcat);
	const resultFromAWSCrypto = awsCryptoHash.digestSync();
	const signatureString = _encodeBase64Bytes(resultFromAWSCrypto);
	return signatureString;
}

function getLargeAValue(authenticationHelper) {
	return new Promise(res => {
		authenticationHelper.getLargeAValue((err, aValue) => {
			res(aValue);
		});
	});
}

function getPasswordAuthenticationKey({
	authenticationHelper,
	username,
	password,
	serverBValue,
	salt,
}) {
	return new Promise((res, rej) => {
		authenticationHelper.getPasswordAuthenticationKey(
			username,
			password,
			serverBValue,
			salt,
			(err, hkdf) => {
				if (err) {
					return rej(err);
				}

				res(hkdf);
			}
		);
	});
}
