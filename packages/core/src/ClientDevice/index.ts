// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { clientInfo, dimension } from './browser';

export class ClientDevice {
	static clientInfo() {
		return clientInfo();
	}

	static dimension() {
		return dimension();
	}
}
