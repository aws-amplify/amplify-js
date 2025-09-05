// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getContentType } from '../../src/utils/contentType';

describe('getContentType', () => {
	it('should return File.type when data is a File with type', () => {
		const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
		expect(getContentType(file, 'test.jpg')).toBe('image/jpeg');
	});

	it('should return MIME type based on file extension', () => {
		expect(getContentType('data', 'image.png')).toBe('image/png');
		expect(getContentType('data', 'video.mp4')).toBe('video/mp4');
		expect(getContentType('data', 'document.pdf')).toBe('application/pdf');
	});

	it('should handle files with multiple dots by using last extension', () => {
		expect(getContentType('data', 'myfile.tar.gz')).toBe('application/gzip');
		expect(getContentType('data', 'archive.tar.bz')).toBe('application/x-bzip');
		expect(getContentType('data', 'data.json.zip')).toBe('application/zip');
	});

	it('should handle case insensitive extensions', () => {
		expect(getContentType('data', 'IMAGE.PNG')).toBe('image/png');
		expect(getContentType('data', 'Video.MP4')).toBe('video/mp4');
	});

	it('should return undefined for unknown extensions', () => {
		expect(getContentType('data', 'file.unknown')).toBeUndefined();
		expect(getContentType('data', 'noextension')).toBeUndefined();
	});

	it('should prefer File.type over extension detection', () => {
		const file = new File(['content'], 'test.png', { type: 'image/jpeg' });
		expect(getContentType(file, 'test.png')).toBe('image/jpeg');
	});

	it('should fallback to extension when File has no type', () => {
		const file = new File(['content'], 'test.png', { type: '' });
		expect(getContentType(file, 'test.png')).toBe('image/png');
	});
});
