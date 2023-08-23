// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointAnalyticsEvent } from '@aws-amplify/core/internals/providers/pinpoint';
import { RecordParameters } from '../../../types';

export type PinpointRecordParameters = RecordParameters<PinpointAnalyticsEvent>;
