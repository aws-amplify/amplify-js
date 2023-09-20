import { __modelMeta__ } from '../../src/types';
import { PersistentModel, PersistentModelConstructor } from '../../src';
import { initSchema as _initSchema } from '../../src/datastore/datastore';
import * as schemas from './schemas';
import { getDataStore } from './datastoreFactory';
import { FakeGraphQLService } from './fakes';
import { jitteredExponentialRetry } from '@aws-amplify/core/internals/utils';

/**
 * Convenience function to wait for a number of ms.
 *
 * Intended as a cheap way to wait for async operations to settle.
 *
 * @param ms number of ms to pause for
 */
export async function pause(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Case insensitive regex that matches GUID's and UUID's.
 * It does NOT permit whitespace on either end of the string. The caller must `trim()` first as-needed.
 */
export const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Tests a mutation for expected values. If values are present on the mutation
 * that are not expected, throws an error. Expected values can be listed as a
 * literal value, a regular expression, or a function (v => bool).
 *
 * `id` is automatically tested and expected to be a UUID unless an alternative
 *  matcher is provided.
 *
 * @param mutation A mutation record to check
 * @param values An object for specific values to test. Format of key: value | regex | v => bool
 */
export function expectMutation(mutation, values) {
	const data = JSON.parse(mutation.data);
	const matchers = {
		id: UUID_REGEX,
		...values,
	};
	const errors = [
		...errorsFrom(data, matchers),
		...extraFieldsFrom(data, matchers).map(f => `Unexpected field: ${f}`),
	];
	if (errors.length > 0) {
		throw new Error(
			`Bad mutation: ${JSON.stringify(data, null, 2)}\n${errors.join('\n')}`
		);
	}
}

export function expectType<T>(_param: T): _param is T {
	return true;
}

export function dummyInstance<T extends PersistentModel>(): T {
	return <T>{};
}

/**
 * Checks an object for adherence to expected values from a set of matchers.
 * Returns a list of erroneous key-value pairs.
 * @param data the object to validate.
 * @param matchers the matcher functions/values/regexes to test the object with
 */
export function errorsFrom<T extends Object>(
	data: T,
	matchers: Record<string, any>
) {
	return Object.entries(matchers).reduce((errors, [property, matcher]) => {
		const value = data[property];
		if (
			!(
				(typeof matcher === 'function' && matcher(value)) ||
				(matcher instanceof RegExp && matcher.test(value)) ||
				(typeof matcher === 'object' &&
					JSON.stringify(value) === JSON.stringify(matcher)) ||
				value === matcher
			)
		) {
			errors.push(
				`Property '${property}' value "${value}" does not match "${matcher}"` as never
			);
		}
		return errors;
	}, []);
}

/**
 * Checks to see if a given object contains any extra, unexpected properties.
 * If any are present, it returns the list of unexpected fields.
 *
 * @param data the object that MIGHT contain extra fields.
 * @param template the authorative template object.
 */
export function extraFieldsFrom(data, template) {
	const fields = Object.keys(data);
	const expectedFields = new Set(Object.keys(template));
	return fields.filter(name => !expectedFields.has(name));
}

/**
 * Left-pads or truncates a string to a desired width.
 *
 * The defaults of `{ width: 2, fillter: '0' }` are intended for padding date
 * and time components, but could also be used for log line fields.
 *
 * For example:
 *
 * ```
 * padLeft("123", 4, '0') === '0123'
 * padLeft("123", 2, '0') === '23'
 * ```
 *
 * @param str String to pad.
 * @param width Width the final string will be.
 * @param filler The string to pad with.
 * @returns A left-padded or truncated string.
 */
export function padLeft(str, width: number = 2, filler = '0') {
	const pad = [...new Array(width)].map(entry => filler).join('');
	const buffer = pad + String(str);
	return buffer.substring(buffer.length - width, buffer.length);
}

/**
 * Right-pads or truncates a string to a desired width.
 *
 * Intended for padding fields in log lines.
 *
 * For example:
 *
 * ```
 * padRight("abcd", 3, ' ') === 'abc'
 * padRight("ab",   3, ' ') === 'ab '
 * ```
 *
 * @param str String to pad.
 * @param width Width the final string will be.
 * @param filler The string to pad with.
 * @returns A right-padded or truncated string.
 */
export function padRight(str, width: number, filler = ' ') {
	const pad = [...new Array(width)].map(entry => filler).join('');
	const buffer = String(str) + pad;
	return buffer.substring(0, width);
}

/**
 * Time format to use in debug logging for consistency and readability.
 *
 * Format:
 *
 * ```
 * HH:MM:SS.μμμ
 * ```
 *
 * Examples:
 *
 * ```
 * 12:34:45.678
 * 01:02:03.004
 * ```
 */
export function logDate() {
	const d = new Date();
	return [
		padLeft(d.getHours()),
		':',
		padLeft(d.getMinutes()),
		':',
		padLeft(d.getSeconds()),
		'.',
		padLeft(d.getMilliseconds(), 3),
	].join('');
}

/**
 * Private.
 *
 * Interval used by `warpTime`. Lives in this scope so that `unwarpTime` can
 * find it during cleanup.
 */
let warpTimeTick;

/**
 * Injects fake `setInterval`, `setTimeout`, and other time-related functions
 * to allow us to make "time" happen faster during testing. Time will happen
 * faster according to a given `multiplier`.
 *
 * Time warping is accomplished with a combination of jest's `useFakeTimers`
 * and invoking `jest.advanceTimersByTime()` using a *real* interval created
 * prior to injecting the fakes.
 *
 * Once time warping is on, you can advance time in your tests *beyond* what
 * time warping already does by calling any of jest's time manipulation
 * functions: https://archive.jestjs.io/docs/en/24.x/timer-mocks
 *
 * **IMPORTANT:** Remember to return back to normal at the end of your test
 * by calling `unwarpTime()`, Doctor.
 *
 * > *Tinkering with time can weaken the very fabric of the universe.*
 *
 * Be careful.
 *
 * @param multiplier How much faster than regular time should we run?
 */
export function warpTime(multiplier = 20) {
	warpTimeTick = setInterval(() => {
		jest.advanceTimersByTime(25 * multiplier);
	}, 25);
	jest.useFakeTimers();
}

/**
 * Stops warping time and returns time-related functions to their builtin
 * implementations.
 */
export function unwarpTime() {
	jest.useRealTimers();
	clearInterval(warpTimeTick);
}

/**
 * Tricks DataStore into performing sync operation by:
 *
 * 1. setting a fake AppSync endpoint (localhost)
 * 1. starting DataStore
 * 1. telling the mutations processor that it's "ready"
 * 1. setting model sync'd status to `false` across the board.
 *
 * Remember to `unconfigureSync()` after the tests are done.
 *
 * ```
 * beforeEach(async () => {
 *  ({ DataStore } = getDataStore());
 * 	await configureSync(DataStore);
 * });
 *
 * afterEach(async () => {
 * 	await unconfigureSync(DataStore);
 * });
 * ```
 *
 * @param DataStore The DataStore instance to operate against.
 * @param isReady Whether to pretend DataStore mutatinos processor is
 * ready, where readiness tells DataStore to attempt to push mutations
 * at the AppSync endpoint.
 */
export async function configureSync(DataStore, isReady = () => false) {
	(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint =
		'https://0.0.0.0/does/not/exist/graphql';

	// WARNING: When DataStore starts, it immediately start the sync
	// engine, which won't have our isReady mock in place yet. This
	// should trigger a *single*
	await DataStore.start();

	const syncEngine = (DataStore as any).sync;

	// my jest spy-fu wasn't up to snuff here. but, this succesfully
	// prevents the mutation process from clearing the mutation queue, which
	// allows us to observe the state of mutations.
	(syncEngine as any).mutationsProcessor.isReady = isReady;
	DataStore.sync.getModelSyncedStatus = (model: any) => false;
}

/**
 * Removes the appsync endpoint, so that if the instance is restarted, it will
 * not try to talk to AppSync or spin up the sync engine.
 *
 * @param DataStore The DataStore instance to operate against.
 */
export async function unconfigureSync(DataStore) {
	(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint = undefined;
}

/**
 * Configures sync and instructs DataStore to operate as though all models
 * are synced from AppSync.
 */
export async function pretendModelsAreSynced(DataStore: any) {
	await configureSync(DataStore);
	DataStore.sync.getModelSyncedStatus = (model: any) => true;
}

/**
 * Executes a given test script at warp speed against a fresh DataStore
 * instance `cycle` times, clearing between cycles.
 *
 * The intended use is for tests that intentionally try to leak background
 * work between test contexts, as was possible prior the introduction of
 * `BackgroundProcessManager`'s and clean `stop()` methods on DataStore
 * and its processors.
 *
 * @see warpTime
 *
 * @param script A test script to execute.
 * @param cycles The number of cyclcles to run.
 * @param focusedLogging Whether to timestamp and filter all error, warn, and
 * debug logging and include additional logging around each test cycle.
 */
export async function expectIsolation(
	script: (ctx: {
		DataStore: any;
		Post: PersistentModelConstructor<schemas.Post>;
		cycle: number;
	}) => Promise<any>,
	cycles = 5,
	focusedLogging = false
) {
	try {
		warpTime();

		if (focusedLogging) {
			(console as any)._warn = console.warn;
			console.warn = (...args) => {
				if (!args[0].match(/ensure credentials|User is unauthorized/)) {
					(console as any)._warn(logDate(), ...args);
				}
			};

			(console as any)._error = console.error;
			console.error = (...args) => {
				if (!args[0].match(/AuthError/)) {
					(console as any)._error(logDate(), ...args);
				}
			};

			(console as any)._debug = console.debug;
			console.debug = (...args) => {
				(console as any)._debug(logDate(), ...args);
			};
		}

		const log = line => {
			if (focusedLogging) {
				console.debug(line);
			}
		};

		log(`STARTING:      "${expect.getState().currentTestName}"`);

		// basic initialization
		const { DataStore, Post } = getDataStore();

		for (let cycle = 1; cycle <= cycles; cycle++) {
			// act
			try {
				log(
					`start cycle:   "${expect.getState().currentTestName}" cycle ${cycle}`
				);
				await script({ DataStore, Post, cycle });
				log(
					`end cycle:     "${expect.getState().currentTestName}" cycle ${cycle}`
				);
			} finally {
				// clean up
				log(
					`before clear: "${expect.getState().currentTestName}" cycle ${cycle}`
				);
				await DataStore.clear();
				log(
					`after clear:  "${expect.getState().currentTestName}" cycle ${cycle}`
				);
			}

			// expect no errors
			// TODO: upgrade jest and assert no pending timers!
		}
		log(`ENDING:        "${expect.getState().currentTestName}"`);
	} finally {
		if (focusedLogging) {
			console.warn = (console as any)._warn;
			console.error = (console as any)._error;
			console.debug = (console as any)._debug;
		}
		unwarpTime();
	}
}

/**
 * Watches Hub events until an outBoxStatus with isEmpty is received.
 *
 * NOTICE: If the outbox is *already* empty, this will not resolve.
 *
 * @param verbose Whether to log hub events until empty
 */
export async function waitForEmptyOutbox(verbose = false) {
	return new Promise<void>(resolve => {
		const { Hub } = require('@aws-amplify/core');
		const hubCallback = message => {
			if (verbose) console.log('hub event', message);
			if (
				message.payload.event === 'outboxStatus' &&
				message.payload.data.isEmpty
			) {
				Hub.remove('datastore', hubCallback);
				resolve();
			}
		};
		Hub.listen('datastore', hubCallback);
	});
}

/**
 * Watches Hub events until ready event is received
 *
 * NOTICE: If DataStore is *already* ready, this will not resolve.
 *
 * @param verbose Whether to log hub events until empty
 */
export async function waitForDataStoreReady(verbose = false) {
	return new Promise<void>(resolve => {
		const { Hub } = require('@aws-amplify/core');
		const hubCallback = message => {
			if (verbose) console.log('hub event', message);
			if (message.payload.event === 'ready') {
				Hub.remove('datastore', hubCallback);
				resolve();
			}
		};
		Hub.listen('datastore', hubCallback);
	});
}

/**
 * Watches Hub events until syncQueriesReady is received
 *
 * NOTICE: If sync queries have already completed, this will not resolve.
 *
 * @param verbose Whether to log hub events until empty
 */
export async function waitForSyncQueriesReady(verbose = false) {
	return new Promise<void>(resolve => {
		const { Hub } = require('@aws-amplify/core');
		const hubCallback = message => {
			if (verbose) console.log('hub event', message);
			if (message.payload.event === 'syncQueriesReady') {
				Hub.remove('datastore', hubCallback);
				resolve();
			}
		};
		Hub.listen('datastore', hubCallback);
	});
}

/**
 * Used for monitoring the fake GraphQL service. Will validate if it has
 * received and finished processing all updates / sent all subscription
 * messages for a specific model.
 * @param fakeService - the fake GraphQL service
 * @param expectedNumberOfUpdates - the number of updates we expect to have been received for the model
 * @param externalNumberOfUpdates - the number of external updates we expect to receive
 * @param modelName - the name of the model we are updating
 */
type GraphQLServiceSettledParams = {
	graphqlService: any;
	expectedNumberOfUpdates: number;
	externalNumberOfUpdates: number;
	modelName: string;
};

export async function graphqlServiceSettled({
	graphqlService,
	expectedNumberOfUpdates,
	externalNumberOfUpdates,
	modelName,
}: GraphQLServiceSettledParams) {
	/**
	 * Note: Even though we've marked running mutations / subscriptions as complete
	 * in the service, it still takes a moment to receive the updates.
	 * This pause avoids unnecessary retries.
	 */
	await pause(1);

	/**
	 * Due to the addition of artificial latencies, the service may not be
	 * done, so we retry:
	 */
	await jitteredExponentialRetry(
		() => {
			// The test should fail if we haven't ended the simulated disruption:
			const subscriptionMessagesNotStopped =
				!graphqlService.stopSubscriptionMessages;

			// Ensure the service has received all the requests:
			const allUpdatesSent =
				graphqlService.requests.filter(
					({ operation, type, tableName }) =>
						operation === 'mutation' &&
						type === 'update' &&
						tableName === modelName
				).length ===
				expectedNumberOfUpdates + externalNumberOfUpdates;

			// Ensure all mutations are complete:
			const allRunningMutationsComplete =
				graphqlService.runningMutations.size === 0;

			// Ensure we've notified subscribers:
			const allSubscriptionsSent =
				graphqlService.subscriptionMessagesSent.filter(
					([observerMessageName, message]) => {
						return observerMessageName === `onUpdate${modelName}`;
					}
				).length ===
				expectedNumberOfUpdates + externalNumberOfUpdates;

			if (
				allUpdatesSent &&
				allRunningMutationsComplete &&
				allSubscriptionsSent &&
				subscriptionMessagesNotStopped
			) {
				return true;
			} else {
				throw new Error(
					'Fake GraphQL Service did not receive and/or process all updates and/or subscriptions'
				);
			}
		},
		[null],
		undefined,
		undefined
	);
}
