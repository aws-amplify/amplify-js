// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Cache the payload of a response body. It allows multiple calls to the body,
 * for example, when reading the body in both retry decider and error deserializer.
 * Caching body is allowed here because we call the body accessor(blob(), json(),
 * etc.) when body is small or streaming implementation is not available(RN).
 *
 * @internal
 */
export const withMemoization = <T>(payloadAccessor: () => Promise<T>) => {
	let cached: Promise<T>;
	return () => {
		if (!cached) {
			// Explicitly not awaiting. Intermediate await would add overhead and
			// introduce a possible race in the event that this wrapper is called
			// again before the first `payloadAccessor` call resolves.
			cached = payloadAccessor();
		}
		return cached;
	};
};
