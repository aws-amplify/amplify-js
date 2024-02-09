// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingConstraints } from '../types/configuration';

let loggingConstraints: LoggingConstraints | undefined;
let loggingConstraintsETag: string | undefined;

export const getLoggingConstraints = () => loggingConstraints;

export const setLoggingConstraints = (constraints: LoggingConstraints) => {
	loggingConstraints = constraints;
};

export const getLoggingConstraintsETag = () => loggingConstraintsETag;

export const setLoggingConstraintsETag = (eTag: string) => {
	loggingConstraintsETag = eTag;
};
