// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Denotes the medium over which a confirmation code was sent.
 */
export enum DeliveryMedium {
	/** Code was sent via email. */
	EMAIL = 'EMAIL',
	/** Code was sent via text message SMS. */
	SMS = 'SMS',
	/**Code was sent to your phone */
	PHONE = 'PHONE',
	/** Code was sent via some other method not listed here. */
	UNKNOWN = 'UNKNOWN',
}
