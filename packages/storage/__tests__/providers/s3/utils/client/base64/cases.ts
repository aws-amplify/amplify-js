// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const toBase64TestCases = [
	{
		input: '',
		expected: '',
	},
	{
		input: 'ABC123',
		expected: 'QUJDMTIz',
	},
	{
		input: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
		expected:
			'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjEyMzQ1Njc4OTA=',
	},
	{
		input: '!@#$%^&*()_+-={}|[]\\:";<>,.?/~`',
		expected: 'IUAjJCVeJiooKV8rLT17fXxbXVw6Ijs8PiwuPy9+YA==',
	},
	{
		input: '你好，世界！',
		expected: '5L2g5aW977yM5LiW55WM77yB',
	},
	{
		input: '🌞🌍🌟',
		expected: '8J+MnvCfjI3wn4yf',
	},
	{
		input: '  Base64 Encoding  ',
		expected: 'ICBCYXNlNjQgRW5jb2RpbmcgIA==',
	},
	{
		input: 'Line 1\nLine 2\nLine 3',
		expected: 'TGluZSAxCkxpbmUgMgpMaW5lIDM=',
	},
	{
		input: '  TeStInG  ',
		expected: 'ICBUZVN0SW5HICA=',
	},
	{
		input: new Uint8Array([
			89, 100, 197, 233, 147, 124, 200, 199, 19, 39, 232, 147, 245, 41, 42, 13,
		]), // MD5 deigest in hex: 5964c5e9937cc8c71327e893f5292a0d
		expected: 'WWTF6ZN8yMcTJ+iT9SkqDQ==',
	},
];
