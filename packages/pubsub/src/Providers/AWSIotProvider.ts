// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { MqttOverWSProvider, MqttProviderOptions } from './MqttOverWSProvider';
import { Signer, Credentials } from '@aws-amplify/core';

const SERVICE_NAME = 'iotdevicegateway';

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface AWSIoTProviderOptions extends MqttProviderOptions {
	aws_pubsub_region?: string;
	aws_pubsub_endpoint?: string;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
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
