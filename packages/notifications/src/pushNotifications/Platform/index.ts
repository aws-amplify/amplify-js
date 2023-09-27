// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Platform as PlatformInterface } from './types';

const userAgentIncludes = (text: string): boolean => {
	return navigator?.userAgent?.includes(text);
};

const getOS = (): PlatformInterface['OS'] => {
	if (userAgentIncludes('Android')) return 'android';
	if (userAgentIncludes('like Mac')) return 'ios';
	if (userAgentIncludes('Win')) return 'windows';
	if (userAgentIncludes('Mac')) return 'macos';
	if (userAgentIncludes('Linux')) return 'linux';
	if (userAgentIncludes('X11')) return 'unix';
	return 'unknown';
};

const OS = getOS();

export const Platform: PlatformInterface = { OS };
