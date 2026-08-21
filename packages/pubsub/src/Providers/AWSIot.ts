// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Signer } from '@aws-amplify/core/internals/utils';
import {
	AmplifyContext,
	getGlobalContext,
	isAmplifyContext,
} from '@aws-amplify/core';

import { MqttOptions, MqttOverWS } from './MqttOverWS';

const SERVICE_NAME = 'iotdevicegateway';

export interface AWSIoTOptions extends MqttOptions {
	region?: string;
	endpoint?: string;
}

export class AWSIoT extends MqttOverWS {
	private _explicitCtx: AmplifyContext | undefined;

	constructor(options?: AWSIoTOptions);
	constructor(ctx: AmplifyContext, options?: AWSIoTOptions);
	constructor(...args: unknown[]) {
		const hasCtx = isAmplifyContext(args[0]);
		const options: AWSIoTOptions = hasCtx
			? ((args[1] as AWSIoTOptions) ?? {})
			: ((args[0] as AWSIoTOptions) ?? {});
		super(options);
		if (hasCtx) {
			this._explicitCtx = args[0] as AmplifyContext;
		}
	}

	/**
	 * Resolve the AmplifyContext for this provider.
	 * - If an explicit ctx was passed at construction, it is pinned (fixed context by design).
	 * - Otherwise, the global context is resolved fresh per access so that reconfiguration
	 *   (setGlobalContext with a new AmplifyContext) is honored across operations.
	 * @private
	 */
	private get _ctx(): AmplifyContext {
		if (this._explicitCtx) {
			return this._explicitCtx;
		}

		return getGlobalContext();
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
			const session = await this._ctx.fetchAuthSession();

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
