// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	}

	private isGenericObject(body: any): body is Object {
		if (body !== null && typeof body === 'object') {
			try {
				return !(this.byteLength(body) >= 0);
			} catch (error) {
				// If we cannot determine the length of the body, consider it
				// as a generic object and upload a stringified version of it
				return true;
			}
		}
		return false;
	}

	protected _createNewS3Client(config, emitter?: events.EventEmitter) {
		const s3client = createS3Client(config, emitter);
		s3client.middlewareStack.add(
			createPrefixMiddleware(this.opts, this.params.Key),
			prefixMiddlewareOptions
		);
		s3client.middlewareStack.add(
			autoAdjustClockskewMiddleware(s3client.config),
			autoAdjustClockskewMiddlewareOptions
		);
		return s3client;
	}
}
