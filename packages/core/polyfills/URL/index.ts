/**
 * TODO: [v6] remove this polyfill.
 *
 * The `react-native-url-polyfill` package needs to be bundled because it's
 * a commonjs package that would break the users' Jest unit tests, where MJS
 * is not supported by default.
 */
if (process?.env?.NODE_ENV !== 'test') {
	// Loading this polyfill in customers' unit tests will cause undefined
	// variable error in un-mocked react-native package.
	require('react-native-url-polyfill/auto');
}
