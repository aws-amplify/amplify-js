// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	public essentialCredentials(credentials): ICredentials {
		return {
			accessKeyId: credentials.accessKeyId,
			sessionToken: credentials.sessionToken,
			secretAccessKey: credentials.secretAccessKey,
			identityId: credentials.identityId,
			authenticated: credentials.authenticated,
		};
	}

	private attributesToObject(attributes) {
		const obj = {};
		if (attributes) {
			attributes.map(attribute => {
				if (
					attribute.Name === 'email_verified' ||
					attribute.Name === 'phone_number_verified'
				) {
					obj[attribute.Name] =
						this.isTruthyString(attribute.Value) || attribute.Value === true;
				} else {
					obj[attribute.Name] = attribute.Value;
				}
			});
		}
		return obj;
	}

	private isTruthyString(value: any): boolean {
		return (
			typeof value.toLowerCase === 'function' && value.toLowerCase() === 'true'
		);
	}

	private createCognitoUser(username: string): CognitoUser {
		const userData: ICognitoUserData = {
			Username: username,
			Pool: this.userPool,
		};
		userData.Storage = this._storage;

		const { authenticationFlowType } = this._config;

		const user = new CognitoUser(userData);
		if (authenticationFlowType) {
			user.setAuthenticationFlowType(authenticationFlowType);
		}
		return user;
	}

	private _isValidAuthStorage(obj) {
		// We need to check if the obj has the functions of Storage
		return (
			!!obj &&
			typeof obj.getItem === 'function' &&
			typeof obj.setItem === 'function' &&
			typeof obj.removeItem === 'function' &&
			typeof obj.clear === 'function'
		);
	}

	private noUserPoolErrorHandler(config: AuthOptions): AuthErrorTypes {
		if (config) {
			if (!config.userPoolId || !config.identityPoolId) {
				return AuthErrorTypes.MissingAuthConfig;
			}
		}
		return AuthErrorTypes.NoConfig;
	}

	private rejectAuthError(type: AuthErrorTypes): Promise<never> {
		return Promise.reject(new AuthError(type));
	}

	private rejectNoUserPool(): Promise<never> {
		const type = this.noUserPoolErrorHandler(this._config);
		return Promise.reject(new NoUserPoolError(type));
	}

	public async rememberDevice(): Promise<string | AuthError> {
		let currUser;

		try {
			currUser = await this.currentUserPoolUser();
		} catch (error) {
			logger.debug('The user is not authenticated by the error', error);
			return Promise.reject('The user is not authenticated');
		}

		currUser.getCachedDeviceKeyAndPassword();
		return new Promise((res, rej) => {
			currUser.setDeviceStatusRemembered({
				onSuccess: data => {
					res(data);
				},
				onFailure: err => {
					if (err.code === 'InvalidParameterException') {
						rej(new AuthError(AuthErrorTypes.DeviceConfig));
					} else if (err.code === 'NetworkError') {
						rej(new AuthError(AuthErrorTypes.NetworkError));
					} else {
						rej(err);
					}
				},
			});
		});
	}

	public async forgetDevice(): Promise<void> {
		let currUser;

		try {
			currUser = await this.currentUserPoolUser();
		} catch (error) {
			logger.debug('The user is not authenticated by the error', error);
			return Promise.reject('The user is not authenticated');
		}

		currUser.getCachedDeviceKeyAndPassword();
		return new Promise((res, rej) => {
			currUser.forgetDevice({
				onSuccess: data => {
					res(data);
				},
				onFailure: err => {
					if (err.code === 'InvalidParameterException') {
						rej(new AuthError(AuthErrorTypes.DeviceConfig));
					} else if (err.code === 'NetworkError') {
						rej(new AuthError(AuthErrorTypes.NetworkError));
					} else {
						rej(err);
					}
				},
			});
		});
	}

	public async fetchDevices(): Promise<IAuthDevice[]> {
		let currUser;

		try {
			currUser = await this.currentUserPoolUser();
		} catch (error) {
			logger.debug('The user is not authenticated by the error', error);
			throw new Error('The user is not authenticated');
		}

		currUser.getCachedDeviceKeyAndPassword();
		return new Promise((res, rej) => {
			const cb = {
				onSuccess(data) {
					const deviceList: IAuthDevice[] = data.Devices.map(device => {
						const deviceName =
							device.DeviceAttributes.find(
								({ Name }) => Name === 'device_name'
							) || {};

						const deviceInfo: IAuthDevice = {
							id: device.DeviceKey,
							name: deviceName.Value,
						};
						return deviceInfo;
					});
					res(deviceList);
				},
				onFailure: err => {
					if (err.code === 'InvalidParameterException') {
						rej(new AuthError(AuthErrorTypes.DeviceConfig));
					} else if (err.code === 'NetworkError') {
						rej(new AuthError(AuthErrorTypes.NetworkError));
					} else {
						rej(err);
					}
				},
			};
			currUser.listDevices(MAX_DEVICES, null, cb);
		});
	}
}

export const Auth = new AuthClass(null);

Amplify.register(Auth);
