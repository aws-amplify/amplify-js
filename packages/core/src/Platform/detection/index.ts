// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Framework } from '../types';

import { reactWebDetect, reactSSRDetect } from './React';
import { vueWebDetect, vueSSRDetect } from './Vue';
import { svelteWebDetect, svelteSSRDetect } from './Svelte';
import { nextWebDetect, nextSSRDetect } from './Next';
import { nuxtWebDetect, nuxtSSRDetect } from './Nuxt';
import { angularWebDetect, angularSSRDetect } from './Angular';
import { reactNativeDetect } from './ReactNative';
import { expoDetect } from './Expo';
import { webDetect } from './Web';

type PlatformDetectionEntry = {
	platform: Framework;
	detectionMethod: () => boolean;
};

// These are in the order of detection where when both are detectable, the early Framework will be reported
const detectionMap: PlatformDetectionEntry[] = [
	// First, detect mobile
	{ platform: Framework.Expo, detectionMethod: expoDetect },
	{ platform: Framework.ReactNative, detectionMethod: reactNativeDetect },
	// Next, detect web frameworks
	{ platform: Framework.NextJs, detectionMethod: nextWebDetect },
	{ platform: Framework.Nuxt, detectionMethod: nuxtWebDetect },
	{ platform: Framework.Angular, detectionMethod: angularWebDetect },
	{ platform: Framework.React, detectionMethod: reactWebDetect },
	{ platform: Framework.VueJs, detectionMethod: vueWebDetect },
	{ platform: Framework.Svelte, detectionMethod: svelteWebDetect },
	{ platform: Framework.WebUnknown, detectionMethod: webDetect },
	// Last, detect ssr frameworks
	{ platform: Framework.NextJsSSR, detectionMethod: nextSSRDetect },
	{ platform: Framework.NuxtSSR, detectionMethod: nuxtSSRDetect },
	{ platform: Framework.ReactSSR, detectionMethod: reactSSRDetect },
	{ platform: Framework.VueJsSSR, detectionMethod: vueSSRDetect },
	{ platform: Framework.AngularSSR, detectionMethod: angularSSRDetect },
	{ platform: Framework.SvelteSSR, detectionMethod: svelteSSRDetect },
];

export function detect() {
	return (
		detectionMap.find(detectionEntry => detectionEntry.detectionMethod())
			?.platform || Framework.ServerSideUnknown
	);
}
