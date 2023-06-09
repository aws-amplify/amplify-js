// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * A spy for XMLHttpRequest instance including attached listeners to xhr instance and upload instance.
 *
 * @internal
 */
export type XhrSpy = Writeable<XMLHttpRequest> & {
	uploadListeners: Partial<{
		[name in keyof XMLHttpRequestEventTargetEventMap]: Array<
			(event: XMLHttpRequestEventTargetEventMap[name]) => void
		>;
	}>;
	listeners: Partial<{
		[name in keyof XMLHttpRequestEventMap]: Array<
			(event: XMLHttpRequestEventMap[name]) => void
		>;
	}>;
};
