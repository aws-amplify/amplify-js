import { Subscription } from 'rxjs';
import { getDataStore } from './datastoreFactory';
import { Post } from './schemas';
import {
	waitForExpectModelUpdateGraphqlEventCount,
	pause,
	waitForEmptyOutbox,
} from './util';
import {
	MergeStrategy,
	clearSubscriptionDeliveryPromiseList,
	subscriptionDeliveryPromiseList,
} from './fakes/graphqlService';

/**
 * Simulate a second client updating the original post
 * @param originalPostId id of the post to update
 * @param updatedFields field(s) to update
 * @param version version number to be sent with the request (what would have been
 * returned from a query prior to update)
 */
type ExternalPostUpdateParams = {
	originalPostId: string;
	updatedFields: Partial<any>;
	version: number | undefined;
};

/**
 * @param postId `id` of the record that was updated
 * @param version expected final `_version` of the record after all updates are complete
 * @param title expected final `title` of the record after all updates are complete
 * @param blogId expected final `blogId` of the record after all updates are complete
 */
type FinalAssertionParams = {
	postId: string;
	version: number;
	title: string;
	blogId?: string | null;
};

const MUTATION_QUERY = `
mutation operation($input: UpdatePostInput!, $condition: ModelPostConditionInput) {
	updatePost(input: $input, condition: $condition) {
		id
		title
		blogId
		updatedAt
		createdAt
		_version
		_lastChangedAt
		_deleted
	}
}
`;

/**
 * Since we're essentially testing race conditions, we want to test the outbox logic
 * exactly the same each time the tests are run. Minor fluctuations in test runs can
 * cause different outbox behavior, so we set jitter to `0`.
 */
const jitter: number = 0;
const highLatency = 1000;
// When there is latency, add extra latency to subscription events so that they arrive
// after the mutation response is processed out of the outbox.
const highSubscriptionLatency = 1100;
const lowLatency = 15;

/**
 * The PostHarness is a decorator that wraps a `Post` model and offers common operations
 * such as `revise` and `expectCurrentToMatch` for the tester to interact with.
 *
 * Example use:
 * ```
 * const postHarness = await harness.createPostHarness({
 *		title: 'original title',
 *		blogId: 'blog id',
 * });
 * await postHarness.revise('post title 0');
 * postHarness.expectCurrentToMatch({
 *		version: 4,
 *		title: 'update from second client',
 * });
 * ```
 */
class PostHarness {
	harness: UpdateSequenceHarness;
	original: Post;
	constructor(post: Post, harness: UpdateSequenceHarness) {
		this.original = post;
		this.harness = harness;
	}

	/**
	 * Revise this post with a title value.
	 *
	 * This revision will be delayed by 200ms when
	 * ```
	 * harness.userInputLatency = 'slowerThanOutbox';
	 * ```
	 *
	 * This revision will wait for the outbox to settle when
	 * ```
	 * harness.settleOutboxAfterRevisions = true;
	 * ```
	 *
	 * @param title The title value to update this post to
	 */
	async revise(title: string) {
		await this.harness.revisePost(this.original.id, title);
	}

	get currentContents() {
		return this.harness.getCurrentRecord(this.original.id);
	}
}

/**
 * The UpdateSequenceHarness is a decorator for a Datastore instance connected to a graphql fake
 * that offers configuration options and convenience functions for clear testing.
 *
 * It is specific to the creation of `Post` models and subsequent updates.
 *
 * Example use:
 * ```
 * harness = new UpdateSequenceHarness();
 * harness.userInputLatency = 'slowerThanOutbox';
 * harness.latency = 'low';
 * const postHarness = await harness.createPostHarness({
 * 	title: 'original title',
 * });
 * await harness.outboxSettled();
 * await harness.expectUpdateCallCount(0);
 * expect(harness.subscriptionLogs()).toEqual([]);
 * ```
 */
export class UpdateSequenceHarness {
	private datastoreFake: ReturnType<typeof getDataStore>;

	private isUserInputDelayed: boolean = false;

	/**
	 * Should we inject latency before each standard client `Post` revision?
	 *
	 * `slowerThanOutbox` will add 200ms of latency before each revision against datastore
	 */
	userInputDelayed() {
		this.isUserInputDelayed = true;
	}

	private isSettledAfterRevisions: boolean = false;

	/**
	 * Determines whether we settle the outbox and await for the subscription response after each mutation.
	 */
	settleAfterRevisions() {
		this.isSettledAfterRevisions = true;
	}

	/**
	 * All observed updates. Also includes "updates" from initial record creation,
	 * since we start the subscription in the `beforeEach` block.
	 */
	subscriptionLog: Post[] = [];

	subscriptionLogSubscription: Subscription;

	subscriptionLogs(attributes: string[] = ['title', '_version']) {
		return this.subscriptionLog.map(post =>
			attributes.map(attribute => post[attribute]),
		);
	}

	/**
	 * Should there be latency in the datastore sync process?
	 * Latency will be added:
	 * - Before the request is made from datastore to graphql
	 * - Before the response is processed from graphql
	 * - Before the subscription update is sent to update subscriber
	 *
	 * Values:
	 * - `low` will add 15ms of latency for each of these events
	 * - `high` will add 1000ms of latency for each of these events
	 */
	set latency(value: 'low' | 'high') {
		if (value === 'low') {
			this.datastoreFake.graphqlService.setLatencies({
				request: lowLatency,
				response: lowLatency,
				subscriber: lowLatency,
				jitter,
			});
		} else {
			this.datastoreFake.graphqlService.setLatencies({
				request: highLatency,
				response: highLatency,
				subscriber: highSubscriptionLatency,
				jitter,
			});
		}
	}

	constructor(mergeStrategy: MergeStrategy) {
		this.datastoreFake = getDataStore({
			online: true,
			isNode: false,
			mergeStrategy,
		});

		this.subscriptionLogSubscription = this.datastoreFake.DataStore.observe(
			this.datastoreFake.Post,
		).subscribe(({ opType, element }) => {
			if (opType === 'UPDATE') {
				this.subscriptionLog.push(element);
			}
		});
	}

	/**
	 * Wait for the Hub event to be fired indicating that the outbox is empty.
	 *
	 * NOTICE: If the outbox is *already* empty, this will not resolve.
	 */
	async outboxSettled() {
		await waitForEmptyOutbox();
	}

	/**
	 * Wait for all subscription events to be delivered
	 */
	async subscriptionDeliverySettled() {
		await Promise.all(subscriptionDeliveryPromiseList);
	}

	/**
	 * Wait for the outbox and all subscription events to settle
	 */
	async fullSettle() {
		await waitForEmptyOutbox();
		await Promise.all(subscriptionDeliveryPromiseList);
	}

	/**
	 * Watch the graphql fake for an expected number of calls to ensure we've
	 * seen all of the expected behavior resolve before proceeding
	 *
	 * @param expectedEventCount The number of graphql update Post calls expected -OR- an object defining how many
	 * update, updateError and subscription events are expected. When a number is given, the same number of
	 * updates and subscription messages are expected with 0 errors.
	 */
	async expectGraphqlSettledWithEventCount(
		expectedEventCount:
			| number
			| {
					update: number;
					updateSubscriptionMessage: number;
					updateError?: number;
			  },
	) {
		let updateCount: number;
		let updateSubscriptionMessageCount: number;
		let updateErrorCount: number;
		if (typeof expectedEventCount === 'number') {
			updateCount = expectedEventCount;
			updateSubscriptionMessageCount = expectedEventCount;
			updateErrorCount = 0;
		} else {
			updateCount = expectedEventCount.update;
			updateSubscriptionMessageCount =
				expectedEventCount.updateSubscriptionMessage;
			updateErrorCount = expectedEventCount.updateError ?? 0;
		}

		await waitForExpectModelUpdateGraphqlEventCount({
			graphqlService: this.datastoreFake.graphqlService,
			expectedUpdateCallCount: updateCount,
			expectedUpdateSubscriptionMessageCount: updateSubscriptionMessageCount,
			expectedUpdateErrorCount: updateErrorCount,
			modelName: 'Post',
		});
	}

	/**
	 * Create a new Post and decorate it in the post harness, returning the decorated Post
	 * By default, this will wait for the outbox to clear unle
	 *
	 * @param postInputs The input arguments to create the new Post with
	 * @param settleOutbox Should the outbox be settled after create? Defaults to `true`
	 *
	 * @returns A post harness wrapped around a newly created post
	 */
	async createPostHarness(
		args: ConstructorParameters<typeof Post>[0],
		settleOutbox: boolean = true,
	) {
		const original = await this.datastoreFake.DataStore.save(
			new this.datastoreFake.Post(args),
		);
		// We set this to `false` when we want to test updating a record that is still in the outbox.
		if (settleOutbox) {
			await this.outboxSettled();
		}
		return new PostHarness(original, this);
	}

	/**
	 * Teardown this harness instance
	 */
	async destroy() {
		this.subscriptionLogSubscription.unsubscribe();
		await this.clearDatastore();
	}

	async startDatastore() {
		await this.datastoreFake.DataStore.start();
	}

	private async clearDatastore() {
		await this.datastoreFake.DataStore.clear();
	}

	/**
	 * Make a call directly to the graphl service fake which tries to update the given PostId with the given field changes.
	 *
	 * @param args The input args `{originalPostId, updatedFields, version}` with which to make the external update call
	 */
	async externalPostUpdate({
		originalPostId,
		updatedFields,
		version,
	}: ExternalPostUpdateParams) {
		await this.datastoreFake.graphqlService.externalGraphql(
			{
				query: MUTATION_QUERY,
				variables: {
					input: {
						id: originalPostId,
						...updatedFields,
						_version: version,
					},
					condition: null,
				},
				authMode: undefined,
				authToken: undefined,
			},
			// For now we always ignore latency for external mutations. This could be a param if needed.
			true,
		);
	}

	/**
	 * Query post, update, then increment counter.
	 * @param postId - id of the post to update
	 * @param updatedTitle - title to update the post with
	 */
	async revisePost(postId: string, updatedTitle: string) {
		if (this.isUserInputDelayed) {
			await pause(200);
		}
		const retrieved = await this.datastoreFake.DataStore.query(
			this.datastoreFake.Post,
			postId,
		);
		if (retrieved) {
			await this.datastoreFake.DataStore.save(
				this.datastoreFake.Post.copyOf(retrieved, updated => {
					updated.title = updatedTitle;
				}),
			);
		}
		if (this.isSettledAfterRevisions) {
			await this.outboxSettled();
			await this.subscriptionDeliverySettled();
		}
	}

	/**
	 * Get the current stored Post content from the graphql fake
	 *
	 * @param postId The id of the post to fetch from the graphql fake
	 * @returns The fields stored in the graphql service fake for a given post
	 */
	async getCurrentRecord(postId: string) {
		const table = this.datastoreFake.graphqlService.tables.get('Post')!;
		return table.get(JSON.stringify([postId]));
	}
}
