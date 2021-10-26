import { DateUtils } from '../src/Util/DateUtils';

// Mock Date (https://github.com/facebook/jest/issues/2234#issuecomment-308121037)
const OriginalDate = Date;
// @ts-ignore Type 'typeof Date' is not assignable to type 'DateConstructor'.
Date = class extends Date {
	// @ts-ignore Constructors for derived classes must contain a 'super' call.ts(2377)
	constructor() {
		return new OriginalDate('2020-01-01');
	}
};

describe('DateUtils', () => {
	describe('getDateWithClockOffset()', () => {
		it('should return a new Date()', () => {
			expect(DateUtils.getDateWithClockOffset()).toEqual(new Date());
		});
	});

	describe('getClockOffset()', () => {
		it('should default to 0', () => {
			expect(DateUtils.getClockOffset()).toEqual(0);
		});
	});

	describe('with setClockOffset()', () => {
		beforeAll(() => {
			DateUtils.setClockOffset(1000);
		});

		describe('getDateWithClockOffset()', () => {
			expect(DateUtils.getDateWithClockOffset()).toEqual(
				new Date(new Date().getTime() + 1000)
			);
		});
	});

	describe('getHeaderStringFromDate', () => {
		it('should return YYYYMMDDTHHMMSSZ', () => {
			expect(
				DateUtils.getHeaderStringFromDate(new Date())
			).toMatchInlineSnapshot(`"20200101T000000Z"`);
		});
	});

	describe('getDateFromHeaderString', () => {
		it('should return YYYYMMDDTHHMMSSZ', () => {
			expect(
				DateUtils.getDateFromHeaderString('20200101T000000Z')
			).toMatchInlineSnapshot(`2020-01-01T00:00:00.000Z`);
		});
	});

	describe('isClockSkewed', () => {
		it('should be false when within 5 minutes', () => {
			const serverDate = new Date();
			serverDate.setMinutes(4);

			expect(DateUtils.isClockSkewed(serverDate)).toBe(false);
		});

		it('should be true when over 5 minutes', () => {
			const serverDate = new Date();
			serverDate.setMinutes(5);

			expect(DateUtils.isClockSkewed(serverDate)).toBe(true);
		});
	});

	describe('isClockSkewError', () => {
		it('should be true when x-amz-errortype is BadRequestException with a date header', () => {
			const clockSkewError: any = new Error('BadRequestException');
			clockSkewError.response = {
				headers: {
					'x-amzn-errortype': 'BadRequestException',
					date: new Date().toString(),
				},
			};

			expect(DateUtils.isClockSkewError(clockSkewError)).toBe(true);
		});

		// https://github.com/aws-amplify/amplify-js/issues/7913
		it('should be true when x-amz-errortype is InvalidSignatureException with a date header', () => {
			const clockSkewError: any = new Error('InvalidSignatureException');
			clockSkewError.response = {
				headers: {
					'x-amzn-errortype': 'InvalidSignatureException',
					date: new Date().toString(),
				},
			};

			expect(DateUtils.isClockSkewError(clockSkewError)).toBe(true);
		});

		it('should be false for normal errors', () => {
			expect(DateUtils.isClockSkewError(new Error('Response error'))).toBe(
				false
			);
		});
	});
});
