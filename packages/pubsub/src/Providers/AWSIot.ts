// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { MqttOverWS, MqttOptions } from './MqttOverWS';
import { Signer } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '@aws-amplify/core';
const SERVICE_NAME = 'iotdevicegateway';

export interface AWSIoTOptions extends MqttOptions {
	region?: string;
	endpoint?: string;
}

export class AWSIoT extends MqttOverWS {
	constructor(options: AWSIoTOptions = {}) {
		super(options);
	}

	protected get region(): string | undefined {
		return this.options['aws_pubsub_region'];
	}

	protected get endpoint() {
		return (async () => {
			const endpoint = this.options.aws_pubsub_endpoint;

			const serviceInfo = {
				service: SERVICE_NAME,
				region: this.region,
			};
			const session = await fetchAuthSession();

			if (!session.credentials) {
				throw new Error('No auth session credentials');
			}

			const {
				accessKeyId: access_key,
				secretAccessKey: secret_key,
				sessionToken: session_token,
			} = session.credentials;

			const result = Signer.signUrl(
				endpoint,
				{ access_key, secret_key, session_token },
				serviceInfo
			);

			return result;
		})();
	}
}
