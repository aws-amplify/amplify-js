// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { browserOrNode } from '@aws-amplify/core';

export default callback => {
	if (browserOrNode().isBrowser && window.location) {
		const url = window.location.href;

		callback({ url });
	} else if (browserOrNode().isNode) {
		// continue building on ssr
		() => {}; // noop
	} else {
		throw new Error('Not supported');
	}
};
