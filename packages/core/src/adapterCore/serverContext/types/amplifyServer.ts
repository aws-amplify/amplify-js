// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClass } from '../../../singleton';
import { LibraryOptions, ResourcesConfig } from '../../../singleton/types';

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

	export interface RunOperationWithContext {
		<Result>(
			amplifyConfig: ResourcesConfig,
			libraryOptions: LibraryOptions,
			operation: (
				contextSpec: AmplifyServer.ContextSpec
			) => Result | Promise<Result>
		): Promise<Result>;
	}
}
