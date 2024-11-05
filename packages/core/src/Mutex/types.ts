// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface MutexInterface {
	acquire(): Promise<MutexInterface.Releaser>;

	runExclusive<T>(callback: MutexInterface.Worker<T>): Promise<T>;

	isLocked(): boolean;
}

export declare namespace MutexInterface {
	export type Releaser = () => void;

	export type Worker<T> = () => Promise<T> | T;
}
