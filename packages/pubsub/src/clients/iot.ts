// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSIoTProvider, AWSIoTOptions } from '../Providers';

export const generateClient = (options: AWSIoTOptions = {}) => {
	return new AWSIoTProvider(options);
};
