// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Date & time utility functions to abstract the `aws-sdk` away from users.
 * (v2 => v3 modularization is a breaking change)
 *
 * @see https://github.com/aws/aws-sdk-js/blob/6edf586dcc1de7fe8fbfbbd9a0d2b1847921e6e1/lib/util.js#L262
 */

const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;
interface DateUtils {
	clockOffset: number;
	getDateWithClockOffset(): Date;
	getClockOffset(): number;
	getHeaderStringFromDate(date: Date): string;
	getDateFromHeaderString(header: string): Date;
	isClockSkewed(serverDate: Date): boolean;
	isClockSkewError(error: any): boolean;
	setClockOffset(offset: number): void;
}

/**
 * This utility is intended to be deprecated and replaced by `signRequest` and `presignUrl` functions from
 * `clients/middleware/signing/signer/signatureV4`.
 *
 * TODO: refactor the logics here into `signRequest` and `presignUrl` functions and remove this class.
 *
 * @internal
 * @deprecated
 */
export const DateUtils: DateUtils = {
	/**
	 * Milliseconds to offset the date to compensate for clock skew between device & services
	 */
	clockOffset: 0,

	getDateWithClockOffset() {
		if (DateUtils.clockOffset) {
			return new Date(new Date().getTime() + DateUtils.clockOffset);
		} else {
			return new Date();
		}
	},

	/**
	 * @returns {number} Clock offset in milliseconds
	 */
	getClockOffset() {
		return DateUtils.clockOffset;
	},

	getHeaderStringFromDate(date: Date = DateUtils.getDateWithClockOffset()) {
		return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
	},

	getDateFromHeaderString(header: string) {
		const [, year, month, day, hour, minute, second] = header.match(
			/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}).+/,
		) as any[];

		return new Date(
			Date.UTC(
				Number(year),
				Number(month) - 1,
				Number(day),
				Number(hour),
				Number(minute),
				Number(second),
			),
		);
	},

	isClockSkewed(serverDate: Date) {
		// API gateway permits client calls that are off by no more than ±5 minutes
		return (
			Math.abs(
				serverDate.getTime() - DateUtils.getDateWithClockOffset().getTime(),
			) >= FIVE_MINUTES_IN_MS
		);
	},

	isClockSkewError(error: { response: { headers: any } }) {
		if (!error.response || !error.response.headers) {
			return false;
		}

		const { headers } = error.response;

		return Boolean(
			['BadRequestException', 'InvalidSignatureException'].includes(
				headers['x-amzn-errortype'],
			) &&
				(headers.date || headers.Date),
		);
	},

	/**
	 * @param {number} offset Clock offset in milliseconds
	 */
	setClockOffset(offset: number) {
		DateUtils.clockOffset = offset;
	},
};
