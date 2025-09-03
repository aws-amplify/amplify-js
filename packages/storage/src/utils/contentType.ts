// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const MIME_TYPES: Record<string, string> = {
	// Audio
	aac: 'audio/aac',
	mid: 'audio/midi',
	midi: 'audio/x-midi',
	mp3: 'audio/mpeg',
	oga: 'audio/ogg',
	opus: 'audio/ogg',
	wav: 'audio/wav',
	weba: 'audio/webm',
	// Video
	avi: 'video/x-msvideo',
	mp4: 'video/mp4',
	mpeg: 'video/mpeg',
	ogv: 'video/ogg',
	ts: 'video/mp2t',
	webm: 'video/webm',
	// Images
	apng: 'image/apng',
	avif: 'image/avif',
	bmp: 'image/bmp',
	gif: 'image/gif',
	ico: 'image/vnd.microsoft.icon',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',
	tif: 'image/tiff',
	tiff: 'image/tiff',
	webp: 'image/webp',
	// Text
	css: 'text/css',
	csv: 'text/csv',
	htm: 'text/html',
	html: 'text/html',
	ics: 'text/calendar',
	js: 'text/javascript',
	md: 'text/markdown',
	mjs: 'text/javascript',
	txt: 'text/plain',
	// Application
	abw: 'application/x-abiword',
	arc: 'application/x-freearc',
	azw: 'application/vnd.amazon.ebook',
	bin: 'application/octet-stream',
	bz: 'application/x-bzip',
	bz2: 'application/x-bzip2',
	cda: 'application/x-cdf',
	csh: 'application/x-csh',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	eot: 'application/vnd.ms-fontobject',
	epub: 'application/epub+zip',
	gz: 'application/gzip',
	jar: 'application/java-archive',
	json: 'application/json',
	jsonld: 'application/ld+json',
	mpkg: 'application/vnd.apple.installer+xml',
	odp: 'application/vnd.oasis.opendocument.presentation',
	ods: 'application/vnd.oasis.opendocument.spreadsheet',
	odt: 'application/vnd.oasis.opendocument.text',
	ogx: 'application/ogg',
	pdf: 'application/pdf',
	php: 'application/x-httpd-php',
	ppt: 'application/vnd.ms-powerpoint',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	rar: 'application/vnd.rar',
	rtf: 'application/rtf',
	sh: 'application/x-sh',
	tar: 'application/x-tar',
	vsd: 'application/vnd.visio',
	webmanifest: 'application/manifest+json',
	xhtml: 'application/xhtml+xml',
	xls: 'application/vnd.ms-excel',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	xml: 'application/xml',
	zip: 'application/zip',
	// Fonts
	otf: 'font/otf',
	ttf: 'font/ttf',
	woff: 'font/woff',
	woff2: 'font/woff2',
};

/**
 * Detect content type from file data or filename extension
 */
export const getContentType = (data: any, key: string): string | undefined => {
	if (data instanceof File && data.type) {
		return data.type;
	}

	const ext = key.split('.').pop()?.toLowerCase();

	return ext ? MIME_TYPES[ext] : undefined;
};
