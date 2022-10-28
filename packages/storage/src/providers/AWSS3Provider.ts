// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	private _createNewS3Client(
		config: {
			region?: string;
			cancelTokenSource?: CancelTokenSource;
			dangerouslyConnectToHttpEndpointForTesting?: boolean;
			useAccelerateEndpoint?: boolean;
		},
		emitter?: events.EventEmitter
	): S3Client {
		const s3client = createS3Client(config, emitter);
		s3client.middlewareStack.add(
			autoAdjustClockskewMiddleware(s3client.config),
			autoAdjustClockskewMiddlewareOptions
		);
		return s3client;
	}
}
