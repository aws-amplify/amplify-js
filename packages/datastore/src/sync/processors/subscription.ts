import API, { GraphQLResult } from '@aws-amplify/api';
import { ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import Cache from '@aws-amplify/cache';
import Auth from '@aws-amplify/auth';
import Observable from 'zen-observable-ts';
import { InternalSchema, PersistentModel, SchemaModel } from '../../types';
import {
	buildGraphQLOperation,
	TransformerMutationType,
	isOwnerAuthorization,
} from '../utils';
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
			let tokenPayload;

			Object.values(this.schema.namespaces).forEach(namespace => {
				Object.values(namespace.models)
					.filter(({ syncable }) => syncable)
					.forEach(async modelDefinition => {
						const queries = this.typeQuery.get(modelDefinition);

						queries.forEach(
							async ([transformerMutationType, opName, query]) => {
								const [
									isOwner,
									identityClaim,
									ownerField,
									provider,
								] = isOwnerAuthorization(
									modelDefinition,
									transformerMutationType
								);

								const marker = {};

								if (isOwner) {
									// adding ownerField variables to marker
									try {
										if (provider === 'userPools') {
											// token info from Cognito UserPools
											const session = await Auth.currentSession();
											tokenPayload = session.getIdToken().decodePayload();
										} else {
											// token info from OIDC
											const federatedInfo = await Cache.getItem(
												'federatedInfo'
											);
											const { token } = federatedInfo;
											const payload = token.split('.')[1];

											tokenPayload = JSON.parse(
												Buffer.from(payload, 'base64').toString('utf8')
											);
										}
									} catch (err) {
										// Check if there is an owner field, check where this error should be located
										observer.error(
											'Owner field required, sign in is need in order to perform this operation'
										);
										return;
									}

									const ownerFieldValue =
										tokenPayload && tokenPayload[identityClaim];
									marker[ownerField] = ownerFieldValue;
								}

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
							}
						);
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
