// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface QueuedItem {
	readonly id: number;
	readonly bytesSize: number;
	readonly content: string;
	readonly timestamp: string;
}

export interface ItemToAdd extends Pick<QueuedItem, 'content' | 'timestamp'> {}
export interface AddItemWithBytesSize extends ItemToAdd {
	bytesSize: number;
}

export interface QueuedStorage {
	add(
		item: ItemToAdd,
		options?: { dequeueBeforeEnqueue: boolean }
	): Promise<void>;
	peek(n: number): Promise<QueuedItem[]>;
	peekAll(): Promise<QueuedItem[]>;
	delete(items: QueuedItem[]): Promise<void>;
	clear(): Promise<void>;
	isFull(maxBytesSizeInMiB: number): boolean;
}
