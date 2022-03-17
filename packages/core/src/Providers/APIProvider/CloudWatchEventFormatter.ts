import { InputLogEvent } from '@aws-sdk/client-cloudwatch-logs';
import {
	AWS_CLOUDWATCH_BASE_BUFFER_SIZE,
	AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE,
	AWS_CLOUDWATCH_MAX_EVENT_SIZE,
} from '../../Util/Constants';
import { GenericLogEvent } from '../../types/types';
import { ConsoleLogger as Logger, getStringByteSize } from '../../';

const logger = new Logger('APILoggingProvider');
const TRUNCATE_MAX_LENGTH = 5000;

export const cloudWatchEventFromGeneric = (
	event: GenericLogEvent
): InputLogEvent => {
	const {
		context: { logTime: timestamp },
		...message
	} = event;

	return {
		timestamp,
		message: JSON.stringify(message),
	};
};

export const truncateOversizedEvent = (event: InputLogEvent): InputLogEvent => {
	const { timestamp, message } = event;

	try {
		const messageJson = JSON.parse(message);

		const truncatedObj = {
			level: messageJson.level,
			class: messageJson.class,
			message: messageJson.message.substring(0, TRUNCATE_MAX_LENGTH),
		};

		if (messageJson.data != null) {
			truncatedObj[
				'data'
			] = `OBJECT SIZE EXCEEDS CLOUDWATCH EVENT LIMIT. Truncated: ${JSON.stringify(
				messageJson.data
			).substring(0, TRUNCATE_MAX_LENGTH)}`;
		}

		return {
			timestamp,
			message: JSON.stringify(truncatedObj),
		};
	} catch (error) {
		logger.warn('Could not truncate oversized event', error);

		const truncated = JSON.stringify({
			level: 'UNKNOWN',
			class: 'Unknown',
			message:
				'OBJECT SIZE EXCEEDS CLOUDWATCH EVENT LIMIT. Could not parse event to truncate',
		});

		return {
			timestamp,
			message: truncated,
		};
	}
};

export const cloudWatchLogEventBatch = (
	buffer: InputLogEvent[]
): InputLogEvent[] => {
	let totalByteSize = 0;
	let currentEventIdx = 0;

	while (currentEventIdx < buffer.length) {
		let currentEvent = buffer[currentEventIdx];
		let eventSize =
			getStringByteSize(currentEvent.message) + AWS_CLOUDWATCH_BASE_BUFFER_SIZE;

		if (eventSize > AWS_CLOUDWATCH_MAX_EVENT_SIZE) {
			const errString = `Log event exceeds maximum size for CloudWatch logs. Log size: ${eventSize}. Truncating log message.`;
			logger.debug(errString);

			currentEvent = truncateOversizedEvent(currentEvent);
			buffer[currentEventIdx] = currentEvent;

			eventSize =
				new TextEncoder().encode(currentEvent.message).length +
				AWS_CLOUDWATCH_BASE_BUFFER_SIZE;
		}

		if (totalByteSize + eventSize > AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE) {
			break;
		}

		totalByteSize += eventSize;
		currentEventIdx += 1;
	}

	return buffer.slice(0, currentEventIdx);
};
