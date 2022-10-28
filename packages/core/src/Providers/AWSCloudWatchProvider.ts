// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
		let currentEventIdx = 0;
		let totalByteSize = 0;

		while (currentEventIdx < this._dataTracker.logEvents.length) {
			const currentEvent = this._dataTracker.logEvents[currentEventIdx];
			const eventSize = currentEvent
				? new TextEncoder().encode(currentEvent.message).length +
				  AWS_CLOUDWATCH_BASE_BUFFER_SIZE
				: 0;
			if (eventSize > AWS_CLOUDWATCH_MAX_EVENT_SIZE) {
				const errString = `Log entry exceeds maximum size for CloudWatch logs. Log size: ${eventSize}. Truncating log message.`;
				logger.warn(errString);

				currentEvent.message = currentEvent.message.substring(0, eventSize);
			}

			if (totalByteSize + eventSize > AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE)
				break;
			totalByteSize += eventSize;
			currentEventIdx++;
		}

		this._currentLogBatch = this._dataTracker.logEvents.splice(
			0,
			currentEventIdx
		);

		return this._currentLogBatch;
	}

	private async _getNewSequenceTokenAndSubmit(
		payload: PutLogEventsCommandInput
	): Promise<PutLogEventsCommandOutput> {
		try {
			this._nextSequenceToken = undefined;
			this._dataTracker.eventUploadInProgress = true;

			const seqToken = await this._getNextSequenceToken();
			payload.sequenceToken = seqToken;
			const sendLogEventsRepsonse = await this._sendLogEvents(payload);

			this._dataTracker.eventUploadInProgress = false;
			this._currentLogBatch = [];

			return sendLogEventsRepsonse;
		} catch (err) {
			logger.error(
				`error when retrying log submission with new sequence token: ${err}`
			);
			this._dataTracker.eventUploadInProgress = false;

			throw err;
		}
	}

	private _initiateLogPushInterval(): void {
		if (this._timer) {
			clearInterval(this._timer);
		}

		this._timer = setInterval(async () => {
			try {
				if (this._getDocUploadPermissibility()) {
					await this._safeUploadLogEvents();
				}
			} catch (err) {
				logger.error(
					`error when calling _safeUploadLogEvents in the timer interval - ${err}`
				);
			}
		}, 2000);
	}

	private _getDocUploadPermissibility(): boolean {
		return (
			(this._dataTracker.logEvents.length !== 0 ||
				this._currentLogBatch.length !== 0) &&
			!this._dataTracker.eventUploadInProgress
		);
	}
}

export { AWSCloudWatchProvider };
