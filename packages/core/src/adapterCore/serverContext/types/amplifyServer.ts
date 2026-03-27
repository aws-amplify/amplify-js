// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '../../../singleton/AmplifyContext';
import { LibraryOptions, ResourcesConfig } from '../../../singleton/types';

export declare namespace AmplifyServer {
	export interface ContextToken {
		readonly value: symbol;
	}

	export interface ContextSpec {
		readonly token: ContextToken;
	}

	export interface Context {
		amplify: AmplifyContext;
	}

	export type RunOperationWithContext = <Result>(
		amplifyConfig: ResourcesConfig,
		libraryOptions: LibraryOptions,
		operation: (
			contextSpec: AmplifyServer.ContextSpec,
		) => Result | Promise<Result>,
	) => Promise<Result>;
}
