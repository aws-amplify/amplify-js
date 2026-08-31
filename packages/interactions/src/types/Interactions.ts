// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface InteractionsOptions {
	[key: string]: any;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type InteractionsTextMessage = {
	content: string;
	options: {
		messageType: 'text';
	};
};

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type InteractionsVoiceMessage = {
	content: object;
	options: {
		messageType: 'voice';
	};
};

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type InteractionsMessage =
	| InteractionsTextMessage
	| InteractionsVoiceMessage;
