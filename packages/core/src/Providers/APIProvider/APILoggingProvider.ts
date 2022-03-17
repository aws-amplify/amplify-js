import { ConsoleLogger as Logger, LOG_LEVELS, LOG_TYPE } from '../../Logger';
import LoggerConnectivity from './loggerConnectivity';
import {
	LoggingProvider,
	GenericLogEvent,
	APILoggingProviderOptions,
} from '../../types/types';
import { jitteredExponentialRetry, NonRetryableError } from '../../../';
import { postOptions } from './Fetch';
import {
	API_LOGGING_PROVIDER_NAME,
	API_LOGGING_PROVIDER_CATEGORY,
} from '../../Util/Constants';
import { getStringByteSize } from '../../Util/StringUtils';

const logger = new Logger('APILoggingProvider');
const HTTPS = 'https';
const LOCALHOST = 'http://localhost';
const DEFAULT_INTERVAL = 3000;

// Exclude these to avoid infinite loop
const DEFAULT_CLASS_EXCLUDE_LIST = [
	'APILoggingProvider',
	'AWSCloudWatch',
	'Retry', // causes a loop because we're using jitteredExponentialRetry below
];
const LAMBDA_PAYLOAD_LIMIT = 6 * 1024 * 1024; // 6MB

/* 
	Todo:
	* Refactor this into a FSM - managing state will become complex when remote config functionality gets added in P1
*/
class APILoggingProvider implements LoggingProvider {
	static readonly PROVIDER_NAME = API_LOGGING_PROVIDER_NAME;
	static readonly CATEGORY = API_LOGGING_PROVIDER_CATEGORY;

	private config: APILoggingProviderOptions;
	private connectivity: LoggerConnectivity;
	private online: boolean = false;
	private bufferInterval: ReturnType<typeof setInterval>;
	private eventBuffer: GenericLogEvent[] = [];

	constructor(config?: APILoggingProviderOptions) {
		this.configure(config);
	}

	public getProviderName(): string {
		return APILoggingProvider.PROVIDER_NAME;
	}

	public getCategoryName(): string {
		return APILoggingProvider.CATEGORY;
	}

	public configure(
		config: APILoggingProviderOptions
	): object | APILoggingProviderOptions {
		try {
			this.validateConfig(config);
			this.config = this.normalizeConfig(config);

			if (this.config.enabled === true) {
				this.initialize();
			} else {
				this.disable();
			}

			return this.config;
		} catch (error) {
			logger.error('Unable to start: ', error);
		}
	}

	public pushLog(event: GenericLogEvent): void {
		if (this.config?.enabled === false) {
			return;
		}

		if (!this.verifyEvent(event)) {
			return;
		}

		const { context, level, error, message } = event;

		const combinedEvent: GenericLogEvent = {
			level,
			error,
			message,
			context: {
				...this.config.metadata,
				...context,
			},
		};

		this.eventBuffer.push(combinedEvent);
	}

	private validateConfig(config: APILoggingProviderOptions): void {
		if (typeof config?.endpoint !== 'string') {
			throw new Error(
				`Invalid configuration. \`config.endpoint\` must be a string. Received: ${typeof config?.endpoint}`
			);
		}

		const protocolStr = config.endpoint.substring(0, 5).toLowerCase();
		const isUsingLocalhost =
			config.endpoint.substring(0, LOCALHOST.length).toLowerCase() ===
			LOCALHOST;

		if (protocolStr !== HTTPS && !isUsingLocalhost) {
			throw new Error(
				`Invalid configuration. Only HTTPS endpoints are supported. Received: ${protocolStr}`
			);
		}
	}

	private normalizeConfig(
		config: APILoggingProviderOptions
	): APILoggingProviderOptions {
		const normalizedConfig = {
			endpoint: config.endpoint,
			apiKey: config.apiKey,
			metadata: config.metadata,
			enabled: config.enabled ?? true,
			level: config.level ?? LOG_TYPE.WARN,
			bufferInterval: config.bufferInterval ?? DEFAULT_INTERVAL,
			excludeClassList:
				config.excludeClassList instanceof Array
					? [...DEFAULT_CLASS_EXCLUDE_LIST, ...config.excludeClassList]
					: DEFAULT_CLASS_EXCLUDE_LIST,
		};

		return normalizedConfig;
	}

	private initialize() {
		this.subscribeConnectivity();
	}

	private disable() {
		this.clearInterval();
		this.unsubscribeConnectivity();
		this.eventBuffer = [];
	}

	private subscribeConnectivity() {
		if (this.connectivity) {
			return;
		}

		this.connectivity = new LoggerConnectivity();
		this.connectivity.status().subscribe(({ online }) => {
			if (online && !this.online) {
				this.startInterval();
			} else {
				this.clearInterval();
			}

			this.online = online;
			logger.debug('Connectivity status: ', online);
		});
	}

	private unsubscribeConnectivity() {
		if (this.connectivity) {
			this.connectivity.unsubscribe();
			this.connectivity = undefined;
		}
	}

	private startInterval() {
		if (this.bufferInterval) {
			this.clearInterval();
		}

		this.bufferInterval = setInterval(async () => {
			try {
				await this.uploadEvents();
			} catch (error) {
				logger.error(`Could not upload log events`, error);
			}
		}, this.config.bufferInterval);
	}

	private clearInterval() {
		clearInterval(this.bufferInterval);
		this.bufferInterval = undefined;
	}

	/* 
		Filter out events that don't adhere to config settings
	*/
	private verifyEvent(event: GenericLogEvent): boolean {
		const { level, context } = event;

		const configLevelValue = LOG_LEVELS[this.config.level];
		const eventLevelValue = LOG_LEVELS[level];

		if (eventLevelValue < configLevelValue) {
			return false;
		}

		if (this.config.excludeClassList.includes(context.category)) {
			return false;
		}

		return true;
	}

	private async uploadEvents(): Promise<void> {
		const eventBatch = this.genericLogEventBatch(this.eventBuffer);

		if (eventBatch.length < 1) {
			return;
		}

		const body = {
			logs: eventBatch,
		};

		const options = postOptions(body);

		await jitteredExponentialRetry(
			async (endpoint, options) => {
				try {
					await fetch(endpoint, options); // fetch doesnt return info for no-cors request
				} catch (error) {
					// fetch will only fail in the event of a network error. Don't retry
					if (error.message === 'Failed to fetch') {
						throw new NonRetryableError(error.message);
					}
					// all other errors are logged and retried
					logger.warn(error);
					throw error;
				}
			},
			[this.config.endpoint, options]
		);

		// remove events from buffer after the request succeeds
		this.eventBuffer.splice(0, eventBatch.length);
	}

	private genericLogEventBatch(buffer: GenericLogEvent[]): GenericLogEvent[] {
		let totalByteSize = 0;
		let currentEventIdx = 0;

		while (currentEventIdx < buffer.length) {
			const currentEvent = buffer[currentEventIdx];
			const eventSize = getStringByteSize(JSON.stringify(currentEvent));

			if (totalByteSize + eventSize > LAMBDA_PAYLOAD_LIMIT) {
				break;
			}

			totalByteSize += eventSize;
			currentEventIdx += 1;
		}

		return buffer.slice(0, currentEventIdx);
	}
}

export { APILoggingProvider };
