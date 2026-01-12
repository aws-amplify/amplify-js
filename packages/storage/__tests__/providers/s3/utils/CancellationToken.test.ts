// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CancellationToken } from '../../../../src/providers/s3/utils/CancellationToken';

describe('CancellationToken', () => {
	let cancellationToken: CancellationToken;

	beforeEach(() => {
		cancellationToken = new CancellationToken();
	});

	describe('initial state', () => {
		it('should not be cancelled initially', () => {
			expect(cancellationToken.isCancelled()).toBe(false);
		});
	});

	describe('cancel', () => {
		it('should set cancelled state to true', () => {
			cancellationToken.cancel();
			expect(cancellationToken.isCancelled()).toBe(true);
		});

		it('should remain cancelled after multiple cancel calls', () => {
			cancellationToken.cancel();
			cancellationToken.cancel();
			expect(cancellationToken.isCancelled()).toBe(true);
		});
	});

	describe('isCancelled', () => {
		it('should return false before cancellation', () => {
			expect(cancellationToken.isCancelled()).toBe(false);
		});

		it('should return true after cancellation', () => {
			cancellationToken.cancel();
			expect(cancellationToken.isCancelled()).toBe(true);
		});
	});
});
