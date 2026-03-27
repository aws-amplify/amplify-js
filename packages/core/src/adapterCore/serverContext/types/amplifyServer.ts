// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '../../../singleton/AmplifyContext';
import { LibraryOptions, ResourcesConfig } from '../../../singleton/types';

export declare namespace AmplifyServer {
	export type RunOperationWithContext = <Result>(
		amplifyConfig: ResourcesConfig,
		libraryOptions: LibraryOptions,
		operation: (contextSpec: AmplifyContext) => Result | Promise<Result>,
	) => Promise<Result>;
}
