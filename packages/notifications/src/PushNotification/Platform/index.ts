// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Platform as PlatformInterface } from './types';

const getOS = (): PlatformInterface['OS'] => {
	if (navigator?.userAgent?.includes('Win')) return 'windows';
	if (navigator?.userAgent?.includes('Mac')) return 'macos';
	if (navigator?.userAgent?.includes('X11')) return 'unix';
	if (navigator?.userAgent?.includes('Linux')) return 'linux';
	if (navigator?.userAgent?.includes('Android')) return 'android';
	if (navigator?.userAgent?.includes('like Mac')) return 'ios';
	return 'unknown';
};

const OS = getOS();

export const Platform: PlatformInterface = { OS };
