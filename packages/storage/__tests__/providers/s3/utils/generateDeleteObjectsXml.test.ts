// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateDeleteObjectsXml } from '../../../../src/providers/s3/utils/generateDeleteObjectsXml';

describe('generateDeleteObjectsXml', () => {
	describe('single object', () => {
		it('should generate XML for single object with quiet=false', () => {
			const objects = [{ Key: 'test-file.txt' }];
			const result = generateDeleteObjectsXml(objects, false);

			expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(result).toContain(
				'<Delete xmlns="http://s3.amazonaws.com/doc/2006-03-01/">',
			);
			expect(result).toContain('<Quiet>false</Quiet>');
			expect(result).toContain('<Object><Key>test-file.txt</Key></Object>');
			expect(result).toContain('</Delete>');
		});

		it('should generate XML for single object with quiet=true', () => {
			const objects = [{ Key: 'test-file.txt' }];
			const result = generateDeleteObjectsXml(objects, true);

			expect(result).toContain('<Quiet>true</Quiet>');
		});
	});

	describe('multiple objects', () => {
		it('should generate XML for multiple objects', () => {
			const objects = [
				{ Key: 'file1.txt' },
				{ Key: 'file2.txt' },
				{ Key: 'folder/file3.txt' },
			];
			const result = generateDeleteObjectsXml(objects, false);

			expect(result).toContain('<Object><Key>file1.txt</Key></Object>');
			expect(result).toContain('<Object><Key>file2.txt</Key></Object>');
			expect(result).toContain('<Object><Key>folder/file3.txt</Key></Object>');
		});
	});

	describe('empty array', () => {
		it('should generate XML with no objects', () => {
			const objects: { Key: string }[] = [];
			const result = generateDeleteObjectsXml(objects, false);

			expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(result).toContain(
				'<Delete xmlns="http://s3.amazonaws.com/doc/2006-03-01/">',
			);
			expect(result).toContain('<Quiet>false</Quiet>');
			expect(result).toContain('</Delete>');
			expect(result).not.toContain('<Object>');
		});
	});

	describe('special characters', () => {
		it('should handle keys with special characters', () => {
			const objects = [
				{ Key: 'file with spaces.txt' },
				{ Key: 'file-with-dashes.txt' },
				{ Key: 'file_with_underscores.txt' },
			];
			const result = generateDeleteObjectsXml(objects, false);

			expect(result).toContain(
				'<Object><Key>file with spaces.txt</Key></Object>',
			);
			expect(result).toContain(
				'<Object><Key>file-with-dashes.txt</Key></Object>',
			);
			expect(result).toContain(
				'<Object><Key>file_with_underscores.txt</Key></Object>',
			);
		});

		it('should escape XML special characters in keys', () => {
			const objects = [
				{ Key: 'file&name.txt' },
				{ Key: 'file<name>.txt' },
				{ Key: 'file"name".txt' },
				{ Key: "file'name'.txt" },
			];
			const result = generateDeleteObjectsXml(objects, false);

			expect(result).toContain('<Object><Key>file&amp;name.txt</Key></Object>');
			expect(result).toContain(
				'<Object><Key>file&lt;name&gt;.txt</Key></Object>',
			);
			expect(result).toContain(
				'<Object><Key>file&quot;name&quot;.txt</Key></Object>',
			);
			expect(result).toContain(
				'<Object><Key>file&apos;name&apos;.txt</Key></Object>',
			);
		});
	});

	describe('XML structure', () => {
		it('should have correct XML structure', () => {
			const objects = [{ Key: 'test.txt' }];
			const result = generateDeleteObjectsXml(objects, false);

			expect(result.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
				true,
			);

			expect(result).toContain(
				'xmlns="http://s3.amazonaws.com/doc/2006-03-01/"',
			);

			expect(result).toContain('<Quiet>false</Quiet>');
		});
	});
});
