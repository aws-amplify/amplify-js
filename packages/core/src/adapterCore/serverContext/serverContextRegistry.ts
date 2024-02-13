// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyServer } from './types';

const storage = new WeakMap<
	AmplifyServer.ContextToken,
	AmplifyServer.Context
>();

function createToken(): AmplifyServer.ContextToken {
	return {
		value: Symbol('AmplifyServerContextToken'),
	};
}

export const serverContextRegistry = {
	register(context: AmplifyServer.Context): AmplifyServer.ContextSpec {
		const token = createToken();
		storage.set(token, context);

		return { token };
	},
	deregister(contextSpec: AmplifyServer.ContextSpec): boolean {
		return storage.delete(contextSpec.token);
	},
	get(
		contextSpec: AmplifyServer.ContextSpec,
	): AmplifyServer.Context | undefined {
		return storage.get(contextSpec.token);
	},
};
