// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

	private _signed(params, credentials, isAllResponse, { service, region }) {
		const { signerServiceInfo: signerServiceInfoParams, ...otherParams } =
			params;

		const endpoint_region: string =
			region || this._region || this._options.region;
		const endpoint_service: string =
			service || this._service || this._options.service;

		const creds = {
			secret_key: credentials.secretAccessKey,
			access_key: credentials.accessKeyId,
			session_token: credentials.sessionToken,
		};

		const endpointInfo = {
			region: endpoint_region,
			service: endpoint_service,
		};

		const signerServiceInfo = Object.assign(
			endpointInfo,
			signerServiceInfoParams
		);

		const signed_params = Signer.sign(otherParams, creds, signerServiceInfo);

		if (signed_params.data) {
			signed_params.body = signed_params.data;
		}

		logger.debug('Signed Request: ', signed_params);

		delete signed_params.headers['host'];

		return axios(signed_params)
			.then(response => (isAllResponse ? response : response.data))
			.catch(error => {
				logger.debug(error);
				throw error;
			});
	}

	private _request(params, isAllResponse = false) {
		return axios(params)
			.then(response => (isAllResponse ? response : response.data))
			.catch(error => {
				logger.debug(error);
				throw error;
			});
	}

	private _parseUrl(url) {
		const parts = url.split('/');

		return {
			host: parts[2],
			path: '/' + parts.slice(3).join('/'),
		};
	}
}
