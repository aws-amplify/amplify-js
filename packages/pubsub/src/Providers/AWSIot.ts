// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Signer,
	assertOptionalCtxArg,
	createCtxResolver,
} from '@aws-amplify/core/internals/utils';
import { AmplifyContext, isAmplifyContext } from '@aws-amplify/core';

import { MqttOptions, MqttOverWS } from './MqttOverWS';

const SERVICE_NAME = 'iotdevicegateway';

export interface AWSIoTOptions extends MqttOptions {
	region?: string;
	endpoint?: string;
}

export class AWSIoT extends MqttOverWS {
	/**
	 * Resolve the AmplifyContext for this provider (fresh per operation).
	 * - If an explicit ctx was passed at construction, it is pinned (fixed context by design).
	 * - Otherwise, the global context is resolved fresh per access so that reconfiguration
	 *   (setGlobalContext with a new AmplifyContext) is honored across operations.
	 * @private
	 */
	private readonly _resolveCtx: () => AmplifyContext;
	constructor(ctx: AmplifyContext | undefined, options?: AWSIoTOptions);

	constructor(options?: AWSIoTOptions);
	constructor(
		ctxOrOptions?: AmplifyContext | AWSIoTOptions,
		maybeOptions?: AWSIoTOptions,
	) {
		if (isAmplifyContext(ctxOrOptions)) {
			super(maybeOptions ?? {});
			this._resolveCtx = createCtxResolver(ctxOrOptions);
		} else {
			// When a second argument is supplied the caller used the
			// `(ctx, options)` overload, so the first argument is required to be a
			// branded AmplifyContext. Guard against a defined-but-unbranded value
			// being silently swallowed as `options`. In the single-argument form
			// `ctxOrOptions` is legitimately the options object, so no assertion.
			if (maybeOptions !== undefined) {
				assertOptionalCtxArg(ctxOrOptions);
			}
			// `ctxOrOptions` reaching this branch is either the single-argument
			// options object or `undefined`. In the `(undefined, options)` form the
			// caller omitted the context but still supplied options in the second
			// slot, so fall back to `maybeOptions` rather than discarding it.
			super(ctxOrOptions ?? maybeOptions ?? {});
			this._resolveCtx = createCtxResolver();
		}
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
			const session = await this._resolveCtx().fetchAuthSession();

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
