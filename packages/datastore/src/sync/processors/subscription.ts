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
	PredicatesGroup,
	ModelPredicate,
} from '../../types';
import {
	buildSubscriptionGraphQLOperation,
	getAuthorizationRules,
	getUserGroupsFromToken,
	TransformerMutationType,
} from '../utils';
import { ModelPredicateCreator } from '../../predicates';
import { validatePredicate } from '../../util';

const logger = new Logger('DataStore');

export enum CONTROL_MSG {
	CONNECTED = 'CONNECTED',
}

export enum USER_CREDENTIALS {
	'none',
	'unauth',
	'auth',
}

type AuthorizationInfo = {
	authMode: GRAPHQL_AUTH_MODE;
	isOwner: boolean;
	ownerField?: string;
	ownerValue?: string;
};

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

	constructor(
		private readonly schema: InternalSchema,
		private readonly syncPredicates: WeakMap<SchemaModel, ModelPredicate<any>>,
		private readonly amplifyConfig: Record<string, any> = {}
	) {}

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
		const { aws_appsync_authenticationType } = this.amplifyConfig;
		const { authMode, isOwner, ownerField, ownerValue } =
			this.getAuthorizationInfo(
				model,
				userCredentials,
				aws_appsync_authenticationType,
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
		userCredentials: USER_CREDENTIALS,
		defaultAuthType: GRAPHQL_AUTH_MODE,
		cognitoTokenPayload: { [field: string]: any } = {},
		oidcTokenPayload: { [field: string]: any } = {}
	): AuthorizationInfo {
		const rules = getAuthorizationRules(model);

		// Return null if user doesn't have proper credentials for private API with IAM auth
		const iamPrivateAuth =
			defaultAuthType === GRAPHQL_AUTH_MODE.AWS_IAM &&
			rules.find(
				rule => rule.authStrategy === 'private' && rule.provider === 'iam'
			);

		if (iamPrivateAuth && userCredentials === USER_CREDENTIALS.unauth) {
			return null;
		}

		// Group auth should take precedence over owner auth, so we are checking
		// if rule(s) have group authorization as well as if either the Cognito or
		// OIDC token has a groupClaim. If so, we are returning auth info before
		// any further owner-based auth checks.
		const groupAuthRules = rules.filter(
			rule =>
				rule.authStrategy === 'groups' &&
				['userPools', 'oidc'].includes(rule.provider)
		);

		const validGroup =
			(defaultAuthType === GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS ||
				defaultAuthType === GRAPHQL_AUTH_MODE.OPENID_CONNECT) &&
			groupAuthRules.find(groupAuthRule => {
				// validate token against groupClaim
				const cognitoUserGroups = getUserGroupsFromToken(
					cognitoTokenPayload,
					groupAuthRule
				);
				const oidcUserGroups = getUserGroupsFromToken(
					oidcTokenPayload,
					groupAuthRule
				);

				return [...cognitoUserGroups, ...oidcUserGroups].find(userGroup => {
					return groupAuthRule.groups.find(group => group === userGroup);
				});
			});

		if (validGroup) {
			return {
				authMode: defaultAuthType,
				isOwner: false,
			};
		}

		// Owner auth needs additional values to be returned in order to create the subscription with
		// the correct parameters so we are getting the owner value from the Cognito token via the
		// identityClaim from the auth rule.
		const cognitoOwnerAuthRules =
			defaultAuthType === GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
				? rules.filter(
						rule =>
							rule.authStrategy === 'owner' && rule.provider === 'userPools'
				  )
				: [];

		let ownerAuthInfo: AuthorizationInfo;
		cognitoOwnerAuthRules.forEach(ownerAuthRule => {
			const ownerValue = cognitoTokenPayload[ownerAuthRule.identityClaim];

			if (ownerValue) {
				ownerAuthInfo = {
					authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
					isOwner: ownerAuthRule.areSubscriptionsPublic ? false : true,
					ownerField: ownerAuthRule.ownerField,
					ownerValue,
				};
			}
		});

		if (ownerAuthInfo) {
			return ownerAuthInfo;
		}

		// Owner auth needs additional values to be returned in order to create the subscription with
		// the correct parameters so we are getting the owner value from the OIDC token via the
		// identityClaim from the auth rule.
		const oidcOwnerAuthRules =
			defaultAuthType === GRAPHQL_AUTH_MODE.OPENID_CONNECT
				? rules.filter(
						rule => rule.authStrategy === 'owner' && rule.provider === 'oidc'
				  )
				: [];

		oidcOwnerAuthRules.forEach(ownerAuthRule => {
			const ownerValue = oidcTokenPayload[ownerAuthRule.identityClaim];

			if (ownerValue) {
				ownerAuthInfo = {
					authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
					isOwner: ownerAuthRule.areSubscriptionsPublic ? false : true,
					ownerField: ownerAuthRule.ownerField,
					ownerValue,
				};
			}
		});

		if (ownerAuthInfo) {
			return ownerAuthInfo;
		}

		// Fallback: return default auth type
		return {
			authMode: defaultAuthType,
			isOwner: false,
		};
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
					// TODO Should this use `this.amplify.Auth` for SSR?
					const credentials = await Auth.currentCredentials();
					userCredentials = credentials.authenticated
						? USER_CREDENTIALS.auth
						: USER_CREDENTIALS.unauth;
				} catch (err) {
					// best effort to get AWS credentials
				}

				try {
					// retrieving current token info from Cognito UserPools
					// TODO Should this use `this.amplify.Auth` for SSR?
					const session = await Auth.currentSession();
					cognitoTokenPayload = session.getIdToken().decodePayload();
				} catch (err) {
					// best effort to get jwt from Cognito
				}

				try {
					// Checking for the Cognito region in config to see if Auth is configured
					// before attempting to get federated token. We're using the Cognito region
					// because it will be there regardless of user/identity pool being present.
					const { aws_cognito_region, Auth: AuthConfig } = this.amplifyConfig;
					if (!aws_cognito_region || (AuthConfig && !AuthConfig.region)) {
						throw 'Auth is not configured';
					}

					let token;
					// backwards compatibility
					const federatedInfo = await Cache.getItem('federatedInfo');
					if (federatedInfo) {
						token = federatedInfo.token;
					} else {
						const currentUser = await Auth.currentAuthenticatedUser();
						if (currentUser) {
							token = currentUser.token;
						}
					}

					if (token) {
						const payload = token.split('.')[1];
						oidcTokenPayload = JSON.parse(
							Buffer.from(payload, 'base64').toString('utf8')
						);
					}
				} catch (err) {
					logger.debug('error getting OIDC JWT', err);
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

													const predicatesGroup = ModelPredicateCreator.getPredicates(
														this.syncPredicates.get(modelDefinition),
														false
													);

													const { [opName]: record } = data;

													// checking incoming subscription against syncPredicate.
													// once AppSync implements filters on subscriptions, we'll be
													// able to set these when establishing the subscription instead.
													// Until then, we'll need to filter inbound
													if (
														this.passesPredicateValidation(
															record,
															predicatesGroup
														)
													) {
														this.pushToBuffer(
															transformerMutationType,
															modelDefinition,
															record
														);
													}
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

													if (message.includes('"errorType":"Unauthorized"')) {
														return;
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

	private passesPredicateValidation(
		record: PersistentModel,
		predicatesGroup: PredicatesGroup<any>
	): boolean {
		if (!predicatesGroup) {
			return true;
		}

		const { predicates, type } = predicatesGroup;

		return validatePredicate(record, type, predicates);
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
