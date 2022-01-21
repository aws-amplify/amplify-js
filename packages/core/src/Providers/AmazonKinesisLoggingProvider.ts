import { AmazonKinesisLoggerOptions, LoggingProvider } from '../types/types';
import { ConsoleLogger as Logger } from '../Logger';
import {
	AMAZON_KINESIS_LOGGING_PROVIDER_NAME,
	AMAZON_KINESIS_LOGGING_CATEGORY,
	NO_CREDS_ERROR_STRING,
	RETRY_ERROR_CODES,
} from '../Util/Constants';

const logger = new Logger('AmazonKinesisLoggingProvider');

export class AmazonKinesisLoggingProvider implements LoggingProvider {
	static readonly PROVIDER_NAME = AMAZON_KINESIS_LOGGING_PROVIDER_NAME;
	static readonly CATEGORY = AMAZON_KINESIS_LOGGING_CATEGORY;

	private _config: AmazonKinesisLoggerOptions;

	constructor(config?: AmazonKinesisLoggerOptions) {}

	public getProviderName(): string {
		return AmazonKinesisLoggingProvider.PROVIDER_NAME;
	}

	public getCategoryName(): string {
		return AmazonKinesisLoggingProvider.CATEGORY;
	}

	public configure(
		config?: AmazonKinesisLoggerOptions
	): AmazonKinesisLoggerOptions {
		if (!config) return this._config || {};

		return this._config;
	}

	public pushLogs(logs: any[]): void {
		logger.debug('pushing log events to Kinesis...');
	}

	public pause() {}

	public resume() {}
}
