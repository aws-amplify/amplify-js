// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MqttOverWSProvider, MqttOptions } from '../Providers';

export const generateClient = (options: MqttOptions) => {
	return new MqttOverWSProvider(options);
};
