// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	private getEndpointInfo(apiName: string, path: string): ApiInfo {
		const cloud_logic_array = this._options.endpoints;

		if (!Array.isArray(cloud_logic_array)) {
			throw new Error(`API category not configured`);
		}

		const apiConfig = cloud_logic_array.find(api => api.name === apiName);

		if (!apiConfig) {
			throw new Error(`API ${apiName} does not exist`);
		}

		const response: ApiInfo = {
			endpoint: apiConfig.endpoint + path,
		};

		if (typeof apiConfig.region === 'string') {
			response.region = apiConfig.region;
		} else if (typeof this._options.region === 'string') {
			response.region = this._options.region;
		}

		if (typeof apiConfig.service === 'string') {
			response.service = apiConfig.service || 'execute-api';
		} else {
			response.service = 'execute-api';
		}

		if (typeof apiConfig.custom_header === 'function') {
			response.custom_header = apiConfig.custom_header;
		} else {
			response.custom_header = undefined;
		}

		return response;
	}
}

export const RestAPI = new RestAPIClass(null);
Amplify.register(RestAPI);
