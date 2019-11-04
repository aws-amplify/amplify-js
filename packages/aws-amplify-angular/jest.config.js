module.exports = {
	preset: 'jest-preset-angular',
	roots: ['src'],
	setupFilesAfterEnv: ['<rootDir>/test_setup/setup-jest.ts'],
	testURL: 'http://localhost/',
};
