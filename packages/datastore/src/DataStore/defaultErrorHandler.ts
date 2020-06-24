import { SyncError } from '../types';
import { logger } from './logger';

export function defaultErrorHandler(error: SyncError) {
	logger.warn(error);
}
