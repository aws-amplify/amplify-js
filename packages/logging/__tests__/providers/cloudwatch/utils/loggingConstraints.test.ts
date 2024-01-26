// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingConstraints } from '../../../../src/providers/cloudwatch/types/configuration';
import {
	getLoggingConstraints,
	setLoggingConstraints,
} from '../../../../src/providers/cloudwatch/utils/loggingConstraints';

describe('CloudWatch Logging provider: logging constraint utils', () => {
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
			defaultLogLevel: 'INFO',
			categoryLogLevel: {
				API: 'INFO',
				AUTH: 'INFO',
			},
		};

		setLoggingConstraints(updatedLoggingConstraints);

		expect(getLoggingConstraints()).toStrictEqual(updatedLoggingConstraints);
	});
});
