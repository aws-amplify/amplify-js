// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Signer,
	assertOptionalCtxArg,
} from '@aws-amplify/core/internals/utils';
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
	private readonly _explicitCtx: AmplifyContext | undefined;

	constructor(options?: AWSIoTOptions);
	constructor(ctx: AmplifyContext, options?: AWSIoTOptions);
	constructor(
		ctxOrOptions?: AmplifyContext | AWSIoTOptions,
		maybeOptions?: AWSIoTOptions,
	) {
		if (isAmplifyContext(ctxOrOptions)) {
			super(maybeOptions ?? {});
			this._explicitCtx = ctxOrOptions;
		} else {
			// When a second argument is supplied the caller used the
			// `(ctx, options)` overload, so the first argument is required to be a
			// branded AmplifyContext. Guard against a defined-but-unbranded value
			// being silently swallowed as `options`. In the single-argument form
			// `ctxOrOptions` is legitimately the options object, so no assertion.
			if (maybeOptions !== undefined) {
				assertOptionalCtxArg(ctxOrOptions);
			}
			super(ctxOrOptions ?? {});
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
