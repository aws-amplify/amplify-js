import { Subscription } from 'rxjs';
import { getDataStore } from './datastoreFactory';
import { Post } from './schemas';
import {
	waitForExpectModelUpdateGraphqlCallCount,
	pause,
	waitForEmptyOutbox,
} from './util';

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

/**
 * Since we're essentially testing race conditions, we want to test the outbox logic
 * exactly the same each time the tests are run. Minor fluctuations in test runs can
 * cause different outbox behavior, so we set jitter to `0`.
 */
const jitter: number = 0;
const highLatency = 1000;
const lowLatency = 15;

class PostHarness {
	harness: UpdateSequenceHarness;
	original: Post;
	constructor(post: Post, harness: UpdateSequenceHarness) {
		this.original = post;
		this.harness = harness;
	}

	async revise(title: string) {
		await this.harness.revisePost(this.original.id, title);
	}

	expectCurrentToMatch(values: { version; title; blogId? }) {
		this.harness.expectFinalRecordsToMatch({
			postId: this.original.id,
			...values,
		});
	}
}

export class UpdateSequenceHarness {
	datastoreFake: ReturnType<typeof getDataStore>;
	expectedNumberOfInternalUpdates = 0;
	expectedNumberOfExternalUpdates = 0;
	private latencyValue: 'low' | 'high' = 'low';
	connectionSpeed: 'slow' | 'fast' = 'slow';
	settleOutboxAfterRevisions: boolean = false;

	/**
	 * All observed updates. Also includes "updates" from initial record creation,
	 * since we start the subscription in the `beforeEach` block.
	 */
	subscriptionLog: Post[] = [];

	subscriptionLogSubscription: Subscription;

	subscriptionLogs(attributes: string[] = ['title', '_version']) {
		return this.subscriptionLog.map(post =>
			attributes.map(attribute => post[attribute])
		);
	}

	get latency(): 'low' | 'high' {
		return this.latencyValue;
	}

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
				subscriber: highLatency,
				jitter,
			});
		}
		this.latencyValue = value;
	}

	constructor() {
		this.datastoreFake = getDataStore({
			online: true,
			isNode: false,
		});

		this.subscriptionLogSubscription = this.datastoreFake.DataStore.observe(
			this.datastoreFake.Post
		).subscribe(({ opType, element }) => {
			if (opType === 'UPDATE') {
				// const response: SubscriptionLogTuple = [
				// 	element.title,
				// 	// No, TypeScript, there is a version:
				// 	// @ts-ignore
				// 	element._version,
				// ];
				// Track sequence of versions and titles
				this.subscriptionLog.push(element);
			}
		});
	}

	async outboxSettled() {
		await waitForEmptyOutbox();
	}

	async expectUpdateCallCount(expectedCallCount: number) {
		/**
		 * Because we have increased the latency, and don't wait for the outbox
		 * to clear on each mutation, the outbox will merge some of the mutations.
		 * In this example, we expect the number of requests received to be one less than
		 * the actual number of updates. If we were running this test without
		 * increased latency, we'd expect more requests to be received.
		 */
		await waitForExpectModelUpdateGraphqlCallCount({
			graphqlService: this.datastoreFake.graphqlService,
			expectedCallCount,
			modelName: 'Post',
		});
	}

	async createPostHarness(...args: ConstructorParameters<typeof Post>) {
		const original = await this.datastoreFake.DataStore.save(
			new this.datastoreFake.Post(...args)
		);
		return new PostHarness(original, this);
	}

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

	async externalPostUpdate({
		originalPostId,
		updatedFields,
		version,
	}: ExternalPostUpdateParams) {
		await this.datastoreFake.graphqlService.externalGraphql(
			{
				query: `
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
                `,
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
			true
		);
		this.expectedNumberOfExternalUpdates += 1;
	}

	/**
	 * Query post, update, then increment counter.
	 * @param postId - id of the post to update
	 * @param updatedTitle - title to update the post with
	 */
	async revisePost(postId: string, updatedTitle: string) {
		if (this.connectionSpeed === 'fast') {
			await pause(200);
		}
		const retrieved = await this.datastoreFake.DataStore.query(
			this.datastoreFake.Post,
			postId
		);
		if (retrieved) {
			const x = await this.datastoreFake.DataStore.save(
				this.datastoreFake.Post.copyOf(retrieved, updated => {
					updated.title = updatedTitle;
				})
			);
		}
		if (this.settleOutboxAfterRevisions) {
			await this.outboxSettled();
		}

		this.expectedNumberOfInternalUpdates++;
	}

	async expectFinalRecordsToMatch({
		postId,
		version,
		title,
		blogId = undefined,
	}: FinalAssertionParams) {
		// Validate that the record was saved to the service:
		const table = this.datastoreFake.graphqlService.tables.get('Post')!;
		expect(table.size).toEqual(1);

		// Validate that the title was updated successfully:
		const savedItem = table.get(JSON.stringify([postId])) as any;
		expect(savedItem.title).toEqual(title);

		if (blogId) expect(savedItem.blogId).toEqual(blogId);

		// Validate that the `_version` was incremented correctly:
		expect(savedItem._version).toEqual(version);

		// Validate that `query` returns the latest `title` and `_version`:
		const queryResult = await this.datastoreFake.DataStore.query(
			this.datastoreFake.Post,
			postId
		);
		expect(queryResult?.title).toEqual(title);
		// @ts-ignore
		expect(queryResult?._version).toEqual(version);

		if (blogId) expect(queryResult?.blogId).toEqual(blogId);
	}
}
