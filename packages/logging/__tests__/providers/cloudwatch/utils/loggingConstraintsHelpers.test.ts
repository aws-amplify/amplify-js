// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingConstraints } from '../../../../src/providers/cloudwatch/types/configuration';
import {
	getLoggingConstraints,
	getLoggingConstraintsETag,
	setLoggingConstraints,
	setLoggingConstraintsETag,
} from '../../../../src/providers/cloudwatch/utils';

describe('CloudWatch Logging utils: logging constraints helpers', () => {
	describe('Constraints helpers', () => {
		const loggingConstraints: LoggingConstraints = {
			defaultLogLevel: 'INFO',
			categoryLogLevel: {
				API: 'INFO',
				AUTH: 'INFO',
			},
		};

		it('should be undefined until set', () => {
			expect(getLoggingConstraints()).toBeUndefined();
		});

		it('should set logging constraints', () => {
			setLoggingConstraints(loggingConstraints);

			expect(getLoggingConstraints()).toStrictEqual(loggingConstraints);

			const updatedLoggingConstraints: LoggingConstraints = {
				defaultLogLevel: 'WARN',
				categoryLogLevel: {
					API: 'WARN',
					AUTH: 'WARN',
				},
			};

			setLoggingConstraints(updatedLoggingConstraints);

			expect(getLoggingConstraints()).toStrictEqual(updatedLoggingConstraints);
		});
	});

	describe('Constraints ETag helpers', () => {
		const eTag = 'e-tag';

		it('should be undefined until set', () => {
			expect(getLoggingConstraintsETag()).toBeUndefined();
		});

		it('should set logging constraints ETag', () => {
			setLoggingConstraintsETag(eTag);

			expect(getLoggingConstraintsETag()).toStrictEqual(eTag);

			const updatedETag = 'updated-e-tag';

			setLoggingConstraintsETag(updatedETag);

			expect(getLoggingConstraintsETag()).toStrictEqual(updatedETag);
		});
	});
});
