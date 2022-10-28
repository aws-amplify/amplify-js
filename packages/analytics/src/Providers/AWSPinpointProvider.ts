// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	private _endpointRequest(config, event) {
		const { credentials } = config;
		const clientInfo = this._clientInfo || {};
		const clientContext = config.clientContext || {};
		// for now we have three different ways for default endpoint configurations
		// clientInfo
		// clientContext (deprecated)
		// config.endpoint
		const defaultEndpointConfig = config.endpoint || {};
		const demographicByClientInfo = {
			appVersion: clientInfo.appVersion,
			make: clientInfo.make,
			model: clientInfo.model,
			modelVersion: clientInfo.version,
			platform: clientInfo.platform,
		};
		// for backward compatibility
		const {
			clientId,
			appTitle,
			appVersionName,
			appVersionCode,
			appPackageName,
			...demographicByClientContext
		} = clientContext;
		const channelType = event.address
			? clientInfo.platform === 'android'
				? 'GCM'
				: 'APNS'
			: undefined;
		const tmp = {
			channelType,
			requestId: uuid(),
			effectiveDate: new Date().toISOString(),
			...defaultEndpointConfig,
			...event,
			attributes: {
				...defaultEndpointConfig.attributes,
				...event.attributes,
			},
			demographic: {
				...demographicByClientInfo,
				...demographicByClientContext,
				...defaultEndpointConfig.demographic,
				...event.demographic,
			},
			location: {
				...defaultEndpointConfig.location,
				...event.location,
			},
			metrics: {
				...defaultEndpointConfig.metrics,
				...event.metrics,
			},
			user: {
				userId:
					event.userId ||
					defaultEndpointConfig.userId ||
					credentials.identityId,
				userAttributes: {
					...defaultEndpointConfig.userAttributes,
					...event.userAttributes,
				},
			},
		};

		// eliminate unnecessary params
		const {
			userId,
			userAttributes,
			name,
			session,
			eventId,
			immediate,
			...ret
		} = tmp;
		return transferKeyToUpperCase(
			ret,
			[],
			['metrics', 'userAttributes', 'attributes']
		);
	}

	private _eventError(err: any) {
		logger.error('record event failed.', err);
		logger.warn(
			`Please ensure you have updated your Pinpoint IAM Policy ` +
				`with the Action: "mobiletargeting:PutEvents" ` +
				`in order to record events`
		);
	}

	private async _getCredentials() {
		try {
			const credentials = await Credentials.get();
			if (!credentials) return null;

			logger.debug('set credentials for analytics', credentials);
			return Credentials.shear(credentials);
		} catch (err) {
			logger.debug('ensure credentials error', err);
			return null;
		}
	}
}
