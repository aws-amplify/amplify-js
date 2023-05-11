import { Framework } from '../types';

import { reactWebDetect, reactSSRDetect } from './React';
import { vueWebDetect, vueSSRDetect } from './Vue';
import { svelteWebDetect, svelteSSRDetect } from './Svelte';
import { astroWebDetect, astroSSRDetect } from './Astro';
import { solidWebDetect, solidSSRDetect } from './Solid';
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
export const detectionMap: PlatformDetectionEntry[] = [
	// Detect mobile first
	{ platform: Framework.ReactNative, detectionMethod: reactNativeDetect },
	{ platform: Framework.Expo, detectionMethod: expoDetect },
	// Next detect web frameworks
	{ platform: Framework.NextJs, detectionMethod: nextWebDetect },
	{ platform: Framework.Nuxt, detectionMethod: nuxtWebDetect },
	{ platform: Framework.React, detectionMethod: reactWebDetect },
	{ platform: Framework.VueJs, detectionMethod: vueWebDetect },
	{ platform: Framework.Angular, detectionMethod: angularWebDetect },
	{ platform: Framework.Svelte, detectionMethod: svelteWebDetect },
	{ platform: Framework.Astro, detectionMethod: astroWebDetect },
	{ platform: Framework.SolidJs, detectionMethod: solidWebDetect },
	{ platform: Framework.WebUnknown, detectionMethod: webDetect },
	// Last detect ssr frameworks
	{ platform: Framework.NextJs, detectionMethod: nextSSRDetect },
	{ platform: Framework.NuxtSSR, detectionMethod: nuxtSSRDetect },
	{ platform: Framework.ReactSSR, detectionMethod: reactSSRDetect },
	{ platform: Framework.VueJsSSR, detectionMethod: vueSSRDetect },
	{ platform: Framework.AngularSSR, detectionMethod: angularSSRDetect },
	{ platform: Framework.SvelteSSR, detectionMethod: svelteSSRDetect },
	{ platform: Framework.AstroSSR, detectionMethod: astroSSRDetect },
	{ platform: Framework.SolidJsSSR, detectionMethod: solidSSRDetect },
];
