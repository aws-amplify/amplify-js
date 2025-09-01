// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Detect content type from file data or filename extension
 */
export const getContentType = (data: any, key: string): string | undefined => {
	if (data instanceof File && data.type) {
		return data.type;
	}

	const ext = key.split('.').pop()?.toLowerCase();
	const mimeTypes: Record<string, string> = {
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		webp: 'image/webp',
		svg: 'image/svg+xml',
		pdf: 'application/pdf',
		txt: 'text/plain',
		json: 'application/json',
		xml: 'application/xml',
		html: 'text/html',
		css: 'text/css',
		js: 'application/javascript',
		mp4: 'video/mp4',
		webm: 'video/webm',
		avi: 'video/x-msvideo',
		mov: 'video/quicktime',
		mp3: 'audio/mpeg',
		wav: 'audio/wav',
		ogg: 'audio/ogg',
		zip: 'application/zip',
		tar: 'application/x-tar',
		gz: 'application/gzip',
	};

	return ext ? mimeTypes[ext] : undefined;
};
