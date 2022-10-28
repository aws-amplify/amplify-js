// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0i.exec(userAgent);
	if (anyMatch) {
		return { type: anyMatch[1], version: anyMatch[2] };
	}

	return { type: '', version: '' };
}
