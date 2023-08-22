// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClass } from '../../../singleton';

export namespace AmplifyServer {
	export type ContextToken = {
		readonly value: Symbol;
	};

	export type ContextSpec = {
		readonly token: ContextToken;
	};

	export type Context = {
		amplify: AmplifyClass;
	};
}
