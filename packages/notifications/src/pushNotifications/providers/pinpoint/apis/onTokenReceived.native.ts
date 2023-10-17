// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../eventListeners';
import { OnTokenReceived } from '../types';

export const onTokenReceived: OnTokenReceived = input =>
	addEventListener('tokenReceived', input);
