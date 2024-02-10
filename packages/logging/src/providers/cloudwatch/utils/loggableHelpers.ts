// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import {
	LogLevel,
	LogParams,
	LoggingCategory,
	isWithinCurrentLogLevel,
} from '@aws-amplify/core/internals/utils';

import {
	CategoryLogLevel,
	CloudWatchConfig,
	LoggingConstraint,
	LoggingConstraints,
} from '../types';

const DEFAULT_LOG_LEVEL: LogLevel = 'INFO';

export const isLoggable = async (
	log: LogParams,
	cloudWatchConfig: CloudWatchConfig,
): Promise<boolean> => {
	const { loggingConstraints } = cloudWatchConfig;

	const logLevel = loggingConstraints
		? await resolveLoggingConstraints(log, loggingConstraints)
		: DEFAULT_LOG_LEVEL;

	return isWithinCurrentLogLevel(log.logLevel, logLevel);
};

export const resolveLoggingConstraints = async (
	log: LogParams,
	loggingConstraints: LoggingConstraints,
): Promise<LogLevel> => {
	const { defaultLogLevel, categoryLogLevel } =
		await getLoggingConstraint(loggingConstraints);

	let resolvedCategoryLogLevel;
	if (categoryLogLevel) {
		resolvedCategoryLogLevel = getCategoryLogLevel(log, categoryLogLevel);
	}

	return resolvedCategoryLogLevel ?? defaultLogLevel;
};

const getLoggingConstraint = async (
	loggingConstraints: LoggingConstraints,
): Promise<LoggingConstraint> => {
	const { defaultLogLevel, categoryLogLevel, userLogLevel } =
		loggingConstraints;

	const { userSub = '' } = await fetchAuthSession();

	if (userLogLevel?.[userSub]) {
		return {
			defaultLogLevel: userLogLevel[userSub].defaultLogLevel,
			categoryLogLevel: userLogLevel[userSub]?.categoryLogLevel,
		};
	}

	return {
		defaultLogLevel,
		categoryLogLevel,
	};
};

const getCategoryLogLevel = (
	log: LogParams,
	categoryLogLevel: CategoryLogLevel,
): LogLevel | undefined => {
	const { category } = log;
	if (!category) {
		return undefined;
	}

	const matchedKey = Object.keys(categoryLogLevel).find(
		key => key.toLowerCase() === category.toLowerCase(),
	) as LoggingCategory | undefined;

	return matchedKey ? categoryLogLevel[matchedKey] : undefined;
};
