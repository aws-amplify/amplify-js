import DateHelper from '../src/DateHelper';

// DateHelper is a utility class that provides the date in "ddd MMM D HH:mm:ss UTC YYYY" format.
describe('DateHelper unit tests', () => {
	test('Expect getNowString() to return the date in the correct format', () => {
		const result = new DateHelper();
		const year = new Date().getUTCFullYear();
		expect(result.getNowString()).toContain(year);
	});
});
