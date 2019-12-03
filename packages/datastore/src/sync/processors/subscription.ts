import API, { GraphQLResult } from '@aws-amplify/api';
import { ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import Observable from 'zen-observable-ts';
import { InternalSchema, PersistentModel, SchemaModel } from '../../types';
import { buildGraphQLOperation, TransformerMutationType } from '../utils';
import '@aws-amplify/pubsub';

const logger = new Logger('DataStore');

export enum CONTROL_MSG {
	CONNECTED = 'CONNECTED',
}

class SubscriptionProcessor {
	private readonly typeQuery = new WeakMap<
		SchemaModel,
		[TransformerMutationType, string, string][]
	>();
	private buffer: [
		TransformerMutationType,
		SchemaModel,
		PersistentModel
	][] = [];
	private dataObserver: ZenObservable.Observer<any>;

	constructor(private readonly schema: InternalSchema) {
		this.generateQueries();
	}

	private generateQueries() {
		Object.values(this.schema.namespaces).forEach(namespace => {
			Object.values(namespace.models)
				.filter(({ syncable }) => syncable)
				.forEach(model => {
					const queries = buildGraphQLOperation(model, 'SUBSCRIBE');

					this.typeQuery.set(model, queries);
				});
		});
	}

	private hubQueryCompletionListener(
		completed: Function,
		variables: any,
		capsule: {
			payload: {
				data?: any;
			};
		}
	) {
		if (variables === capsule.payload.data.variables) {
			completed();
		}
	}

	start(): [
		Observable<CONTROL_MSG>,
		Observable<[TransformerMutationType, SchemaModel, PersistentModel]>
	] {
		const ctlObservable = new Observable<CONTROL_MSG>(observer => {
			const promises: Promise<void>[] = [];
			const subscriptions: ZenObservable.Subscription[] = [];

			Object.values(this.schema.namespaces).forEach(namespace => {
				Object.values(namespace.models)
					.filter(({ syncable }) => syncable)
					.forEach(async modelDefinition => {
						const queries = this.typeQuery.get(modelDefinition);

						queries.forEach(([transformerMutationType, opName, query]) => {
							const marker = {};

							const queryObservable = <
								Observable<{
									value: GraphQLResult<Record<string, PersistentModel>>;
								}>
							>(<unknown>API.graphql({ query, variables: marker }));

							subscriptions.push(
								queryObservable
									.map(({ value }) => value)
									.subscribe({
										next: ({ data, errors }) => {
											if (Array.isArray(errors) && errors.length > 0) {
												const messages = (<
													{
														message: string;
													}[]
												>errors).map(({ message }) => message);

												logger.warn(
													`Skipping incoming subscription. Messages: ${messages.join(
														'\n'
													)}`
												);

												this.drainBuffer();
												return;
											}

											const { [opName]: record } = data;

											this.pushToBuffer(
												transformerMutationType,
												modelDefinition,
												record
											);

											this.drainBuffer();
										},
										error: subscriptionError => {
											const {
												error: { errors: [{ message = '' } = {}] } = {
													errors: [],
												},
											} = subscriptionError;
											observer.error(message);
										},
									})
							);

							promises.push(
								(async () => {
									let boundFunction: any;

									await new Promise(res => {
										boundFunction = this.hubQueryCompletionListener.bind(
											this,
											res,
											marker
										);
										Hub.listen('api', boundFunction);
									});
									Hub.remove('api', boundFunction);
								})()
							);
						});
					});
			});

			Promise.all(promises).then(() => observer.next(CONTROL_MSG.CONNECTED));

			return () => {
				subscriptions.forEach(subscription => subscription.unsubscribe());
			};
		});

		const dataObservable = new Observable<
			[TransformerMutationType, SchemaModel, PersistentModel]
		>(observer => {
			this.dataObserver = observer;
			this.drainBuffer();

			return () => {
				this.dataObserver = null;
			};
		});

		return [ctlObservable, dataObservable];
	}

	private pushToBuffer(
		transformerMutationType: TransformerMutationType,
		modelDefinition: SchemaModel,
		data: PersistentModel
	) {
		this.buffer.push([transformerMutationType, modelDefinition, data]);
	}

	private drainBuffer() {
		if (this.dataObserver) {
			this.buffer.forEach(data => this.dataObserver.next(data));
			this.buffer = [];
		}
	}
}

export { SubscriptionProcessor };
