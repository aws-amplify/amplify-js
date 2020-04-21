import { DateUtils } from '../src/Util/DateUtils';

// Mock Date (https://github.com/facebook/jest/issues/2234#issuecomment-308121037)
const staticDate = new Date('2020-01-01');
// @ts-ignore Type 'typeof Date' is not assignable to type 'DateConstructor'.
Date = class extends Date {
	// @ts-ignore Constructors for derived classes must contain a 'super' call.ts(2377)
	constructor() {
		return staticDate;
	}
};

describe('Date', () => {
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

		describe('getDate()', () => {
			expect(DateUtils.getDateWithClockOffset()).toEqual(
				new Date(new Date().getTime() + 1000)
			);
		});
	});
});
