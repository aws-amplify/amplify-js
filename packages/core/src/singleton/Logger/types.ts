// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggerProvider } from '../../Logger/types';

export type LibraryLoggerOptions = {
	providers: [LoggerProvider, ...LoggerProvider[]];
};
