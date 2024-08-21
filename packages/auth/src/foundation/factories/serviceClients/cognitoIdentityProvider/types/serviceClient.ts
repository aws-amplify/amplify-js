// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EndpointResolverOptions } from '@aws-amplify/core/internals/aws-client-utils';

export interface ServiceClientFactoryInput {
	endpointResolver(options: EndpointResolverOptions): { url: URL };
}
