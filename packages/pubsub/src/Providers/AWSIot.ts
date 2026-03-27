// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Signer } from '@aws-amplify/core/internals/utils';
import { AmplifyContext } from '@aws-amplify/core';

import { MqttOptions, MqttOverWS } from './MqttOverWS';

const SERVICE_NAME = 'iotdevicegateway';

export interface AWSIoTOptions extends MqttOptions {
	region?: string;
	endpoint?: string;
}

export class AWSIoT extends MqttOverWS {
	private ctx: AmplifyContext;

	constructor(ctx: AmplifyContext, options: AWSIoTOptions = {}) {
		super(options);
		this.ctx = ctx;
	}

	protected get region(): string | undefined {
		return this.options?.region;
	}

	protected get endpoint() {
		return (async () => {
			const { endpoint } = this.options;

			const serviceInfo = {
				service: SERVICE_NAME,
				region: this.region,
			};
			const session = await this.ctx.fetchAuthSession();

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
				serviceInfo,
			);

			return result;
		})();
	}
}
