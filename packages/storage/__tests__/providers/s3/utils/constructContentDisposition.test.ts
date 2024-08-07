import { constructContentDisposition } from '../../../../src/providers/s3/utils/constructContentDisposition';
import { ContentDisposition } from '../../../../src/providers/s3/types/options';

describe('constructContentDisposition', () => {
	it('should return undefined when input is undefined', () => {
		expect(constructContentDisposition(undefined)).toBeUndefined();
	});

	it('should return the input string when given a string', () => {
		const input = 'inline; filename="example.txt"';
		expect(constructContentDisposition(input)).toBe(input);
	});

	it('should construct disposition string with filename when given an object with type and filename', () => {
		const input: ContentDisposition = {
			type: 'attachment',
			filename: 'example.pdf',
		};
		expect(constructContentDisposition(input)).toBe(
			'attachment; filename="example.pdf"',
		);
	});

	it('should return only the type when given an object with type but no filename', () => {
		const input: ContentDisposition = {
			type: 'inline',
		};
		expect(constructContentDisposition(input)).toBe('inline');
	});

	it('should handle empty string filename', () => {
		const input: ContentDisposition = {
			type: 'attachment',
			filename: '',
		};
		expect(constructContentDisposition(input)).toBe('attachment; filename=""');
	});

	it('should handle filenames with spaces', () => {
		const input: ContentDisposition = {
			type: 'attachment',
			filename: 'my file.txt',
		};
		expect(constructContentDisposition(input)).toBe(
			'attachment; filename="my file.txt"',
		);
	});

	it('should handle filenames with special characters', () => {
		const input: ContentDisposition = {
			type: 'attachment',
			filename: 'file"with"quotes.txt',
		};
		expect(constructContentDisposition(input)).toBe(
			'attachment; filename="file"with"quotes.txt"',
		);
	});

	// Edge cases
	it('should return undefined for null input', () => {
		expect(constructContentDisposition(null as any)).toBeUndefined();
	});

	it('should return undefined for number input', () => {
		expect(constructContentDisposition(123 as any)).toBeUndefined();
	});
});
