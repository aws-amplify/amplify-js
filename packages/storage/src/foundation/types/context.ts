// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

/**
 * Read a `Blob` (or `File`) into an `ArrayBuffer`. Implementation differs
 * between client (`FileReader`) and server (`Blob.arrayBuffer()`).
 *
 * Injected into foundation-layer functions via {@link FoundationContext}.
 */
export type ReadFile = (blob: Blob) => Promise<ArrayBuffer>;

/**
 * Encode a string or binary buffer as base64. Browser implementations use
 * `btoa`/`TextEncoder`; Node.js and React Native use `Buffer`.
 *
 * Injected into foundation-layer functions via {@link FoundationContext}.
 */
export type ToBase64 = (input: string | ArrayBufferView) => string;

/**
 * Per-invocation context passed into foundation-layer functions by the
 * client or server layer. It carries dependencies that are either
 * environment-specific or environment-scoped (e.g. a request-scoped
 * `AmplifyClassV6` on the server).
 *
 * All environment-specific behavior the foundation needs MUST be injected
 * through this object so the foundation layer stays free of any
 * environment-discriminating logic.
 */
export interface FoundationContext {
	/**
	 * The Amplify instance. On the client this is the global singleton;
	 * on the server this is a request-scoped instance from the server adapter.
	 */
	amplify: AmplifyClassV6;

	/**
	 * Reads a `Blob` into an `ArrayBuffer`.
	 *
	 * On the client this wraps `FileReader` (browser) or the React Native
	 * equivalent. On the server this wraps `Blob.arrayBuffer()`.
	 */
	readFile: ReadFile;

	/**
	 * Encodes a string or binary buffer as base64.
	 *
	 * On the client (browser) this uses `btoa` + `TextEncoder`. On React
	 * Native and the server this uses `Buffer`.
	 */
	toBase64: ToBase64;
}
