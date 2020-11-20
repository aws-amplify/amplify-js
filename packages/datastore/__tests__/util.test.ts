import {
	isAWSDate,
	isAWSDateTime,
	isAWSEmail,
	isAWSTime,
	isAWSTimestamp,
	isAWSJSON,
	isAWSURL,
	isAWSPhone,
	isAWSIPAddress,
} from "../src/util";

describe('datastore util', () => {
	test('isAWSDate', () => {
		const valid = [
			'2020-01-01',
			'1979-01-01Z',
			'2021-01-01+05:30',
			'2021-01-01-05:30:12',
		];
		const invalid = [
			'',
			'2021-01-1',
			'201-01-50',
			'2021-01-112',
			'2021-01-01+5:30',
			'2021-01-01+05:3',
			'2021-01-01+05:3.',
			'2021-01-01-05:30:12Z',
			// '2021-99-99',
			// '2021-01-21+99:02'
		];
		valid.forEach(test => {
			expect(isAWSDate(test)).toBe(true);
		});
		invalid.forEach(test => {
			expect(isAWSDate(test)).toBe(false);
		});
	});

	test('isAWSTime', () => {
		const valid = [
			'12:30',
			'12:30Z',
			'12:30:24Z',
			'12:30:24-07:00',
			'12:30:24.500+05:30',
			'12:30:24.500+05:30:00',
		];
		const invalid = [
			'',
			'1:30',
			'12:30.Z',
			'120:30:242Z',
			'12:30:242Z',
			'12:30:24-07:00Z',
			'12:30:24.500+05:3',
			'12:30.500+05:30',
			'12:30:.500Z',
			'12:30:24.500+5:30:00',
		];
		valid.forEach(test => {
			expect(isAWSTime(test)).toBe(true);
		});
		invalid.forEach(test => {
			expect(isAWSTime(test)).toBe(false);
		});
	});

	test('isAWSDateTime', () => {
		const valid = [
			'2021-01-11T12:30',
			'2021-01-11T12:30Z',
			'2021-01-11T12:30:24Z',
			'2021-01-11T12:30:24-07:00',
			'2021-01-11T12:30:24.500+05:30',
			'2021-01-11T12:30:24.500+05:30:00',
		];
		const invalid = [
			'',
			'2021-01-11T1:30',
			'2021-01-11T12:30.Z',
			'2021-01-11T120:30:242Z',
			'2021-01-11T12:30:242Z',
			'2021-01-11T12:30:24-07:00Z',
			'2021-01-11T12:30:24.500+05:3',
			'2021-01-11T12:30.500+05:30',
			'2021-01-11T12:30:.500Z',
			'2021-01-11T12:30:24.500+5:30:00',
			'2021-1-11T12:30Z',
			'2021-01-11T1:30Z',
			'2021-01-11T1:3',
			'20211-01-11T12:30:.500Z',
		];
		valid.forEach(test => {
			expect(isAWSDateTime(test)).toBe(true);
		});
		invalid.forEach(test => {
			expect(isAWSDateTime(test)).toBe(false);
		});
	});

	test('isAWSTimestamp', () => {
		const valid = [
			0,
			123,
			123456,
			123456789,
		];
		const invalid = [
			-1,
			-123,
			-123456,
			-1234567
		];
		valid.forEach(test => {
			expect(isAWSTimestamp(test)).toBe(true);
		});
		invalid.forEach(test => {
			expect(isAWSTimestamp(test)).toBe(false);
		});
	});

	test('isAWSEmail', () => {
		const valid = [
			'a@b',
			'a@b.c',
			'jeff@amazon.com',
		];
		const invalid = [
			'',
			'@',
			'a',
			'a@',
			'a@@',
			'@a',
			'@@',
			'a @b.c',
			'a@ b.c',
			'a@b. c',
		];
		valid.forEach(test => {
			expect(isAWSEmail(test)).toBe(true);
		});
		invalid.forEach(test => {
			expect(isAWSEmail(test)).toBe(false);
		});
	});

	test('isAWSJSON', () => {
		const valid = [
			'{"upvotes": 10}',
			'{}',
			'[1,2,3]',
			'[]',
			'"AWSJSON example string"',
			'1',
			'0',
			'-1',
			'true',
			'false',
		];
		const invalid = [
			'',
			'#',
			'2020-01-01',
			'{a: 1}',
			'{‘a’: 1}',
			'Unquoted string',
		];
		valid.forEach(test => {
			expect(isAWSJSON(test)).toBe(true);
		});
		invalid.forEach(test => {
			expect(isAWSJSON(test)).toBe(false);
		});
	});

	test('isAWSURL', () => {
		const valid = [
			'http://localhost/',
			'schema://anything',
			'smb://a/b/c?d=e',
		];
		const invalid = [
			'',
			'//',
			'//example',
			'example',
		];
		valid.forEach(test => {
			expect(isAWSURL(test)).toBe(true);
		});
		invalid.forEach(test => {
			expect(isAWSURL(test)).toBe(false);
		});
	});

	test('isAWSPhone', () => {
		const valid = [
			'+10000000000',
			'+100 00 00',
			'000 00000',
			'123-456-7890',
			'+44123456789',
		];
		const invalid = [
			'',
			'+',
			'+-',
			'a',
			'bad-number',
		];
		valid.forEach(test => {
			expect(isAWSPhone(test)).toBe(true);
		});
		invalid.forEach(test => {
			expect(isAWSPhone(test)).toBe(false);
		});
	});

	test('isAWSIPAddress', () => {
		const valid = [
			'127.0.0.1',
			'123.123.123.123',
			'1.1.1.1',
			'::',
			'::1',
			'2001:db8:a0b:12f0::1',
			'::ffff:10.0.0.1',
			'0064:ff9b:0000:0000:0000:0000:1234:5678',
		];
		const invalid = [
			'',
			' ',
			':',
			'1.',
			'test',
			'999.1.1.1',
			' 1.1.1.1',
			'1.1.1.1 ',
			'-1.1.1.1',
			'1111.111.111.111',
			'1.0.0',
			'::1 ',
			'::ffff:10.0.0',
			' ::ffff:10.0.0',
		];
		valid.forEach(test => {
			expect(isAWSIPAddress(test)).toBe(true);
		});
		invalid.forEach(test => {
			expect(isAWSIPAddress(test)).toBe(false);
		});
	});
});
