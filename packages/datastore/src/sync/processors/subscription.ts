import API, { GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import Auth from '@aws-amplify/auth';
import Cache from '@aws-amplify/cache';
import { ConsoleLogger as Logger, Hub, HubCapsule } from '@aws-amplify/core';
import { CONTROL_MSG as PUBSUB_CONTROL_MSG } from '@aws-amplify/pubsub';
import Observable, { ZenObservable } from 'zen-observable-ts';
import {
	InternalSchema,
	PersistentModel,
	SchemaModel,
	SchemaNamespace,
} from '../../types';
import {
	buildSubscriptionGraphQLOperation,
	getAuthorizationRules,
	TransformerMutationType,
} from '../utils';

const logger = new Logger('DataStore');

export enum CONTROL_MSG {
	CONNECTED = 'CONNECTED',
}

export enum USER_CREDENTIALS {
	'none',
	'unauth',
	'auth',
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

	constructor(private readonly schema: InternalSchema) {}

	private buildSubscription(
		namespace: SchemaNamespace,
		model: SchemaModel,
		transformerMutationType: TransformerMutationType,
		userCredentials: USER_CREDENTIALS,
		cognitoTokenPayload: { [field: string]: any } | undefined,
		oidcTokenPayload: { [field: string]: any } | undefined
	): {
		opType: TransformerMutationType;
		opName: string;
		query: string;
		authMode: GRAPHQL_AUTH_MODE;
		isOwner: boolean;
		ownerField?: string;
		ownerValue?: string;
	} {
		const { authMode, isOwner, ownerField, ownerValue } =
			this.getAuthorizationInfo(
				model,
				transformerMutationType,
				userCredentials,
				cognitoTokenPayload,
				oidcTokenPayload
			) || {};

		const [opType, opName, query] = buildSubscriptionGraphQLOperation(
			namespace,
			model,
			transformerMutationType,
			isOwner,
			ownerField
		);
		return { authMode, opType, opName, query, isOwner, ownerField, ownerValue };
	}

	private getAuthorizationInfo(
		model: SchemaModel,
		transformerMutationType: TransformerMutationType,
		userCredentials: USER_CREDENTIALS,
		cognitoTokenPayload: { [field: string]: any } = {},
		oidcTokenPayload: { [field: string]: any } = {}
	): {
		authMode: GRAPHQL_AUTH_MODE;
		isOwner: boolean;
		ownerField?: string;
		ownerValue?: string;
	} {
		let result;
		const rules = getAuthorizationRules(model, transformerMutationType);

		// check if has apiKey and public authorization
		const apiKeyAuth = rules.find(
			rule => rule.authStrategy === 'public' && rule.provider === 'apiKey'
		);

		if (apiKeyAuth) {
			return { authMode: GRAPHQL_AUTH_MODE.API_KEY, isOwner: false };
		}

		// check if has iam authorization
		if (
			userCredentials === USER_CREDENTIALS.unauth ||
			userCredentials === USER_CREDENTIALS.auth
		) {
			const iamPublicAuth = rules.find(
				rule => rule.authStrategy === 'public' && rule.provider === 'iam'
			);

			if (iamPublicAuth) {
				return { authMode: GRAPHQL_AUTH_MODE.AWS_IAM, isOwner: false };
			}

			const iamPrivateAuth =
				userCredentials === USER_CREDENTIALS.auth &&
				rules.find(
					rule => rule.authStrategy === 'private' && rule.provider === 'iam'
				);

			if (iamPrivateAuth) {
				return { authMode: GRAPHQL_AUTH_MODE.AWS_IAM, isOwner: false };
			}
		}

		// if not check if has groups authorization and token has groupClaim allowed for cognito token
		let groupAuthRules = rules.filter(
			rule => rule.authStrategy === 'groups' && rule.provider === 'userPools'
		);

		const validCognitoGroup = groupAuthRules.find(groupAuthRule => {
			// validate token agains groupClaim
			const userGroups: string[] =
				cognitoTokenPayload[groupAuthRule.groupClaim] || [];

			return userGroups.find(userGroup => {
				return groupAuthRule.groups.find(group => group === userGroup);
			});
		});

		if (validCognitoGroup) {
			return {
				authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				isOwner: false,
			};
		}

		// if not check if has groups authorization and token has groupClaim allowed for oidc token
		groupAuthRules = rules.filter(
			rule => rule.authStrategy === 'groups' && rule.provider === 'oidc'
		);

		const validOidcGroup = groupAuthRules.find(groupAuthRule => {
			// validate token agains groupClaim
			const userGroups: string[] =
				oidcTokenPayload[groupAuthRule.groupClaim] || [];

			userGroups.find(userGroup => {
				return groupAuthRule.groups.find(group => group === userGroup);
			});
		});

		if (validOidcGroup) {
			return {
				authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
				isOwner: false,
			};
		}

		// check if has owner auth authorization and token ownerField for cognito token
		let ownerAuthRules = rules.filter(
			rule => rule.authStrategy === 'owner' && rule.provider === 'userPools'
		);

		ownerAuthRules.forEach(ownerAuthRule => {
			const ownerValue = cognitoTokenPayload[ownerAuthRule.identityClaim];

			if (ownerValue) {
				result = {
					authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
					isOwner: ownerAuthRule.areSubscriptionsPublic ? false : true,
					ownerField: ownerAuthRule.ownerField,
					ownerValue,
				};
			}
		});

		if (result) {
			return result;
		}

		// check if has owner auth authorization and token ownerField for oidc token
		ownerAuthRules = rules.filter(
			rule => rule.authStrategy === 'owner' && rule.provider === 'oidc'
		);

		ownerAuthRules.forEach(ownerAuthRule => {
			const ownerValue = oidcTokenPayload[ownerAuthRule.identityClaim];

			if (ownerValue) {
				result = {
					authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
					isOwner: ownerAuthRule.areSubscriptionsPublic ? false : true,
					ownerField: ownerAuthRule.ownerField,
					ownerValue,
				};
			}
		});

		if (result) {
			return result;
		}

		return null;
	}

	private hubQueryCompletionListener(completed: Function, capsule: HubCapsule) {
		const {
			payload: { event },
		} = capsule;

		if (event === PUBSUB_CONTROL_MSG.SUBSCRIPTION_ACK) {
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
			let cognitoTokenPayload: { [field: string]: any },
				oidcTokenPayload: { [field: string]: any };
			let userCredentials = USER_CREDENTIALS.none;
			(async () => {
				try {
					// retrieving current AWS Credentials
					const credentials = await Auth.currentCredentials();
					userCredentials = credentials.authenticated
						? USER_CREDENTIALS.auth
						: USER_CREDENTIALS.unauth;
				} catch (err) {
					// best effort to get AWS credentials
				}

				try {
					// retrieving current token info from Cognito UserPools
					const session = await Auth.currentSession();
					cognitoTokenPayload = session.getIdToken().decodePayload();
				} catch (err) {
					// best effort to get jwt from Cognito
				}

				try {
					// retrieving token info from OIDC
					const federatedInfo = await Cache.getItem('federatedInfo');
					const { token } = federatedInfo;
					const payload = token.split('.')[1];

					oidcTokenPayload = JSON.parse(
						Buffer.from(payload, 'base64').toString('utf8')
					);
				} catch (err) {
					// best effort to get oidc jwt
				}

				Object.values(this.schema.namespaces).forEach(namespace => {
					Object.values(namespace.models)
						.filter(({ syncable }) => syncable)
						.forEach(async modelDefinition => {
							const queriesMetadata = [
								TransformerMutationType.CREATE,
								TransformerMutationType.UPDATE,
								TransformerMutationType.DELETE,
							].map(op =>
								this.buildSubscription(
									namespace,
									modelDefinition,
									op,
									userCredentials,
									cognitoTokenPayload,
									oidcTokenPayload
								)
							);

							queriesMetadata.forEach(
								async ({
									opType: transformerMutationType,
									opName,
									query,
									isOwner,
									ownerField,
									ownerValue,
									authMode,
								}) => {
									const variables = {};

									if (isOwner) {
										if (!ownerValue) {
											// Check if there is an owner field, check where this error should be located
											observer.error(
												'Owner field required, sign in is needed in order to perform this operation'
											);
											return;
										}

										variables[ownerField] = ownerValue;
									}

									const queryObservable = <
										Observable<{
											value: GraphQLResult<Record<string, PersistentModel>>;
										}>
									>(<unknown>API.graphql({ query, variables, ...{ authMode } })); // use default authMode if not found

									let subscriptionReadyCallback: () => void;

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
													logger.warn('subscriptionError', message);

													if (typeof subscriptionReadyCallback === 'function') {
														subscriptionReadyCallback();
													}

													observer.error(message);
												},
											})
									);

									promises.push(
										(async () => {
											let boundFunction: any;

											await new Promise(res => {
												subscriptionReadyCallback = res;
												boundFunction = this.hubQueryCompletionListener.bind(
													this,
													res
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
			})();

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
