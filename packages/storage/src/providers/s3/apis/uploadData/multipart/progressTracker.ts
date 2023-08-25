// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TransferProgressEvent } from '../../../../../types';

type ConcurrentUploadsProgressTrackerOptions = {
	totalLength?: number;
	onProgress?: (event: TransferProgressEvent) => void;
};

/**
 * Track the progress from multiple concurrent uploads, and invoke the onProgress callback.
 *
 * @internal
 */
export const getConcurrentUploadsProgressTracker = ({
	totalLength,
	onProgress,
}: ConcurrentUploadsProgressTrackerOptions) => {
	const transferredBytesPerListener: number[] = [];

	const getTransferredBytes = () =>
		transferredBytesPerListener.reduce(
			(acc, transferredBytes) => acc + transferredBytes,
			0
		);

	return {
		getOnProgressListener: () => {
			transferredBytesPerListener.push(0);
			const listenerIndex = transferredBytesPerListener.length - 1;
			return (event: TransferProgressEvent) => {
				const { transferredBytes } = event;
				transferredBytesPerListener[listenerIndex] = transferredBytes;
				onProgress?.({
					transferredBytes: getTransferredBytes(),
					totalBytes: totalLength,
				});
			};
		},
	};
};
