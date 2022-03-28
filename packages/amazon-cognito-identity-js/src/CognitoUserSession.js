/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/** @class */
export default class CognitoUserSession {
	/**
	 * Constructs a new CognitoUserSession object
	 * @param {CognitoIdToken} IdToken The session's Id token.
	 * @param {CognitoRefreshToken=} RefreshToken The session's refresh token.
	 * @param {CognitoAccessToken} AccessToken The session's access token.
	 * @param {int} ClockDrift The saved computer's clock drift or undefined to force calculation.
	 */
	constructor({ IdToken, RefreshToken, AccessToken, ClockDrift } = {}) {
		if (AccessToken == null || IdToken == null) {
			throw new Error('Id token and Access Token must be present.');
		}

		this.idToken = IdToken;
		this.refreshToken = RefreshToken;
		this.accessToken = AccessToken;
		this.clockDrift =
			ClockDrift === undefined ? this.calculateClockDrift() : ClockDrift;
	}

	/**
	 * @returns {CognitoIdToken} the session's Id token
	 */
	getIdToken() {
		return this.idToken;
	}

	/**
	 * @returns {CognitoRefreshToken} the session's refresh token
	 */
	getRefreshToken() {
		return this.refreshToken;
	}

	/**
	 * @returns {CognitoAccessToken} the session's access token
	 */
	getAccessToken() {
		return this.accessToken;
	}

	/**
	 * @returns {int} the session's clock drift
	 */
	getClockDrift() {
		return this.clockDrift;
	}

	/**
	 * @returns {int} the computer's clock drift
	 */
	calculateClockDrift() {
		const now = Math.floor(new Date() / 1000);
		const iat = Math.min(
			this.accessToken.getIssuedAt(),
			this.idToken.getIssuedAt()
		);

		return now - iat;
	}

	/**
	 * Checks to see if the session is still valid based on session expiry information found
	 * in tokens and the current time (adjusted with clock drift)
	 * @returns {boolean} if the session is still valid
	 */
	isValid() {
		const now = Math.floor(new Date() / 1000);
		const adjusted = now - this.clockDrift;
		
		return (
			adjusted < this.accessToken.getExpiration() &&
			adjusted < this.idToken.getExpiration()
		);
	}
}
