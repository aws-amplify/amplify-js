// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';

export type ChannelType = Parameters<typeof updateEndpoint>[0]['channelType'];
