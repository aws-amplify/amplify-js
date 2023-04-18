// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { MqttOverWSProvider, MqttProviderOptions } from './MqttOverWSProvider';
import { Signer, Credentials } from '@aws-amplify/core';

const SERVICE_NAME = 'iotdevicegateway';

export interface AWSIoTProviderOptions extends MqttProviderOptions {
	aws_pubsub_region?: string;
	aws_pubsub_endpoint?: string;
}

export class AWSIoTProvider extends MqttOverWSProvider {
	constructor(options: AWSIoTProviderOptions = {}) {
		super(options);
	}

	protected get region(): string | undefined {
		return this.options['aws_pubsub_region'];
	}

	public getProviderName() {
		return 'AWSIoTProvider';
	}

	protected get endpoint() {
		return (async () => {
			const endpoint = this.options.aws_pubsub_endpoint;

			const serviceInfo = {
				service: SERVICE_NAME,
				region: this.region,
			};
			const {
				accessKeyId: access_key,
				secretAccessKey: secret_key,
				sessionToken: session_token,
			} = await Credentials.get();

			const result = Signer.signUrl(
				endpoint,
				{ access_key, secret_key, session_token },
				serviceInfo
			);

			return result;
		})();
	}
}
