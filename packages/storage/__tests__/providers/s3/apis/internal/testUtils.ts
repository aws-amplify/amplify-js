import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { type MatcherFunction } from 'expect';

const toBeLastCalledWithConfigAndInput: MatcherFunction<
	[config: { credentials: unknown }, input: unknown]
> = async function toBeLastCalledWithConfigAndInput(
	actualHandler,
	expectedConfig,
	expectedInput,
) {
	if (!jest.isMockFunction(actualHandler)) {
		return {
			message: () =>
				`expected custom client handler to be a mock function, got ${actualHandler}`,
			pass: false,
		};
	}
	const actualConfig = actualHandler.mock.lastCall?.[0];
	const actualInput = actualHandler.mock.lastCall?.[1];
	const actualConfigWithResolvedCredentials =
		typeof actualConfig?.credentials === 'function'
			? {
					...actualConfig,
					credentials: await actualConfig.credentials(),
				}
			: actualConfig;
	if (
		this.equals(actualConfigWithResolvedCredentials, expectedConfig) &&
		this.equals(actualInput, expectedInput)
	) {
		return {
			message: () => '',
			pass: true,
		};
	}

	return {
		message: () =>
			`expected ${JSON.stringify(actualConfig)} to equal ${JSON.stringify(expectedConfig)} and ${JSON.stringify(actualInput)} to equal ${JSON.stringify(expectedInput)}`,
		pass: false,
	};
};

const toHaveBeenNthCalledWithConfigAndInput: MatcherFunction<
	[nthCall: number, config: unknown, input: unknown]
> = async function toHaveBeenNthCalledWithConfigAndInput(
	actualHandler,
	nthCall,
	expectedConfig,
	expectedInput,
) {
	if (!jest.isMockFunction(actualHandler)) {
		return {
			message: () =>
				`expected custom client handler to be a mock function, got ${actualHandler}`,
			pass: false,
		};
	}
	const actualConfig = actualHandler.mock.calls[nthCall - 1]?.[0];
	const actualInput = actualHandler.mock.calls[nthCall - 1]?.[1];
	const actualConfigWithResolvedCredentials =
		typeof actualConfig?.credentials === 'function'
			? {
					...actualConfig,
					credentials: await actualConfig.credentials(),
				}
			: actualConfig;
	if (
		this.equals(actualConfigWithResolvedCredentials, expectedConfig) &&
		this.equals(actualInput, expectedInput)
	) {
		return {
			message: () => '',
			pass: true,
		};
	}

	return {
		message: () =>
			`expected ${JSON.stringify(actualConfig)} to equal ${JSON.stringify(expectedConfig)} and ${JSON.stringify(actualInput)} to equal ${JSON.stringify(expectedInput)}`,
		pass: false,
	};
};

expect.extend({
	toBeLastCalledWithConfigAndInput,
	toHaveBeenNthCalledWithConfigAndInput,
});

interface ConfigType {
	credentials: AWSCredentials | (() => Promise<AWSCredentials>);
}

declare global {
	namespace jest {
		interface AsymmetricMatchers {
			toBeLastCalledWithConfigAndInput<C extends ConfigType>(
				expectedConfig: C,
				expectedInput: any,
			): void;
			toHaveBeenNthCalledWithConfigAndInput<C extends ConfigType>(
				nthCall: number,
				expectedConfig: C,
				expectedInput: any,
			): void;
		}
		interface Matchers<R> {
			/**
			 * Asynchronously asserts mocked custom client handler to be last called with expected config and input.
			 * If the actual client config has a credential that is a provider function, it will be resolved to static
			 * credential object and matched against the supplied config credentials.
			 */
			toBeLastCalledWithConfigAndInput<C extends ConfigType>(
				expectedConfig: C,
				expectedInput: any,
			): Promise<R>;

			/**
			 * Asynchronously asserts mocked custom client handler to be Nth called with expected config and input.
			 * If the actual client config has a credential that is a provider function, it will be resolved to static
			 * credential object and matched against the supplied config credentials.
			 */
			toHaveBeenNthCalledWithConfigAndInput<C extends ConfigType>(
				nthCall: number,
				expectedConfig: C,
				expectedInput: any,
			): Promise<R>;
		}
	}
}
