// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EndpointResolverOptions } from '@aws-amplify/core/internals/aws-client-utils';

export interface ServiceClientAPIConfig {
	endpointResolver(options: EndpointResolverOptions): { url: URL };
}
