// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * All possible states a `BackgroundProcessManager` instance can be in.
 */
export enum BackgroundProcessManagerState {
	/**
	 * Accepting new jobs.
	 */
	Open = 'Open',

	/**
	 * Not accepting new jobs. Waiting for submitted jobs to complete.
	 */
	Closing = 'Closing',

	/**
	 * Not accepting new jobs. All submitted jobs are complete.
	 */
	Closed = 'Closed',
}

/**
 * Completely internal to `BackgroundProcessManager`, and describes the structure of
 * an entry in the jobs registry.
 */
export interface JobEntry {
	/**
	 * The underlying promise provided by the job function to wait for.
	 */
	promise: Promise<any>;

	/**
	 * Request the termination of the job.
	 */
	terminate(): void;

	/**
	 * An object provided by the caller that can be used to identify the description
	 * of the job, which can otherwise be unclear from the `promise` and
	 * `terminate` function. The `description` can be a string. (May be extended
	 * later to also support object refs.)
	 *
	 * Useful for troubleshooting why a manager is waiting for long periods of time
	 * on `close()`.
	 */
	description?: string;
}
