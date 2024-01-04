// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

interface WithBytesSize {
	readonly bytesSize: number;
}

export interface ItemToAdd {
	readonly content: string;
	readonly timestamp: string;
}

export interface QueuedItemWeb extends ItemToAdd, WithBytesSize {
	readonly id: number;
	readonly key?: never;
}

export interface QueuedItemNative extends ItemToAdd, WithBytesSize {
	readonly id?: never;
	readonly key: string;
}

export type QueuedItem = QueuedItemWeb | QueuedItemNative;

export interface AddItemWithAuthPropertiesWeb
	extends ItemToAdd,
		WithBytesSize {}

export interface AddItemWithAuthPropertiesNative
	extends ItemToAdd,
		WithBytesSize {
	key: QueuedItemNative['key'];
}

export interface QueuedStorage {
	add(
		item: ItemToAdd,
		options?: { dequeueBeforeEnqueue: boolean }
	): Promise<void>;
	peek(n?: number): Promise<QueuedItem[]>;
	peekAll(): Promise<QueuedItem[]>;
	delete(items: QueuedItem[]): Promise<void>;
	clear(): Promise<void>;
	isFull(maxBytesSizeInMiB: number): boolean;
}
