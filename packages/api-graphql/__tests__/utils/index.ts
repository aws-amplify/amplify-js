export * from './expects';

/**
 * For each call against the spy, assuming the spy is a `post()` spy,
 * replaces fields that are likely to change between calls (or library version revs)
 * with static values. When possible, on the unpredicable portions of these values
 * are replaced.
 *
 * ## THIS IS DESTRUCTIVE
 *
 * The original `spy.mocks.calls` will be updated *and* returned.
 *
 * For example,
 *
 * ```plain
 * headers.x-amz-user-agent: "aws-amplify/6.0.5 api/1 framework/0"
 * ```
 *
 * Is replaced with:
 *
 * ```plain
 * headers.x-amz-user-agent: "aws-amplify/latest api/latest framework/latest"
 * ```
 *
 * @param spy The Jest spy
 */
export function normalizePostGraphqlCalls(spy: jest.SpyInstance<any, any>) {
	return spy.mock.calls.map((call: any) => {
		// The 1st param in `call` is an instance of `AmplifyClassV6`
		// The 2nd param in `call` is the actual `postOptions`
		const [_, postOptions] = call;
		const userAgent = postOptions?.options?.headers?.['x-amz-user-agent'];
		if (userAgent) {
			const staticUserAgent = userAgent.replace(/\/[\d.]+/g, '/latest');
			postOptions.options.headers['x-amz-user-agent'] = staticUserAgent;
		}
		// Calling of `post` API with an instance of `AmplifyClassV6` has been
		// unit tested in other test suites. To reduce the noise in the generated
		// snapshot, we hide the details of the instance here.
		return ['AmplifyClassV6', postOptions];
	});
}
