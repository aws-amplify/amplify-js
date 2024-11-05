// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { GraphQLResult } from '@aws-amplify/api';
import { InternalAPI } from '@aws-amplify/api/internals';
import {
	ConsoleLogger,
	Hub,
	HubCapsule,
	fetchAuthSession,
} from '@aws-amplify/core';
import {
	BackgroundProcessManager,
	Category,
	CustomUserAgentDetails,
	DataStoreAction,
	GraphQLAuthMode,
	JwtPayload,
} from '@aws-amplify/core/internals/utils';
import { Observable, Observer, SubscriptionLike } from 'rxjs';
import { CONTROL_MSG as PUBSUB_CONTROL_MSG } from '@aws-amplify/api-graphql';

import {
	AmplifyContext,
	AuthModeStrategy,
	ErrorHandler,
	InternalSchema,
	ModelPredicate,
	PersistentModel,
	PredicatesGroup,
	ProcessName,
	SchemaModel,
	SchemaNamespace,
} from '../../types';
import {
	RTFError,
	TransformerMutationType,
	buildSubscriptionGraphQLOperation,
	generateRTFRemediation,
	getAuthorizationRules,
	getModelAuthModes,
	getTokenForCustomAuth,
	getUserGroupsFromToken,
	predicateToGraphQLFilter,
} from '../utils';
import { ModelPredicateCreator } from '../../predicates';
import { validatePredicate } from '../../util';

import { getSubscriptionErrorType } from './errorMaps';

const logger = new ConsoleLogger('DataStore');

export enum CONTROL_MSG {
	CONNECTED = 'CONNECTED',
}

export enum USER_CREDENTIALS {
	'none',
	'unauth',
	'auth',
}

interface AuthorizationInfo {
	authMode: GraphQLAuthMode;
	isOwner: boolean;
	ownerField?: string;
	ownerValue?: string;
}

class SubscriptionProcessor {
	private readonly typeQuery = new WeakMap<
		SchemaModel,
		[TransformerMutationType, string, string][]
	>();

	private buffer: [TransformerMutationType, SchemaModel, PersistentModel][] =
		[];

	private dataObserver!: Observer<any>;

	private runningProcesses = new BackgroundProcessManager();

	constructor(
		private readonly schema: InternalSchema,
		private readonly syncPredicates: WeakMap<
			SchemaModel,
			ModelPredicate<any> | null
		>,
		private readonly amplifyConfig: Record<string, any> = {},
		private readonly authModeStrategy: AuthModeStrategy,
		private readonly errorHandler: ErrorHandler,
		private readonly amplifyContext: AmplifyContext = {
			InternalAPI,
		},
	) {}

	private buildSubscription(
		namespace: SchemaNamespace,
		model: SchemaModel,
		transformerMutationType: TransformerMutationType,
		userCredentials: USER_CREDENTIALS,
		oidcTokenPayload: JwtPayload | undefined,
		authMode: GraphQLAuthMode,
		filterArg = false,
	): {
		opType: TransformerMutationType;
		opName: string;
		query: string;
		authMode: GraphQLAuthMode;
		isOwner: boolean;
		ownerField?: string;
		ownerValue?: string;
	} {
		const { aws_appsync_authenticationType } = this.amplifyConfig;
		const { isOwner, ownerField, ownerValue } =
			this.getAuthorizationInfo(
				model,
				userCredentials,
				aws_appsync_authenticationType,
				oidcTokenPayload,
				authMode,
			) || {};

		const [opType, opName, query] = buildSubscriptionGraphQLOperation(
			namespace,
			model,
			transformerMutationType,
			isOwner,
			ownerField!,
			filterArg,
		);

		return { authMode, opType, opName, query, isOwner, ownerField, ownerValue };
	}

	private getAuthorizationInfo(
		model: SchemaModel,
		userCredentials: USER_CREDENTIALS,
		defaultAuthType: GraphQLAuthMode,
		oidcTokenPayload: JwtPayload | undefined,
		authMode: GraphQLAuthMode,
	): AuthorizationInfo {
		const rules = getAuthorizationRules(model);
		// Return null if user doesn't have proper credentials for private API with IAM auth
		const iamPrivateAuth =
			authMode === 'iam' &&
			rules.find(
				rule => rule.authStrategy === 'private' && rule.provider === 'iam',
			);

		if (iamPrivateAuth && userCredentials === USER_CREDENTIALS.unauth) {
			return null!;
		}

		// Group auth should take precedence over owner auth, so we are checking
		// if rule(s) have group authorization as well as if either the Cognito or
		// OIDC token has a groupClaim. If so, we are returning auth info before
		// any further owner-based auth checks.
		const groupAuthRules = rules.filter(
			rule =>
				rule.authStrategy === 'groups' &&
				['userPools', 'oidc'].includes(rule.provider),
		);

		const validGroup =
			(authMode === 'oidc' || authMode === 'userPool') &&
			// eslint-disable-next-line array-callback-return
			groupAuthRules.find(groupAuthRule => {
				// validate token against groupClaim
				if (oidcTokenPayload) {
					const oidcUserGroups = getUserGroupsFromToken(
						oidcTokenPayload,
						groupAuthRule,
					);

					return [...oidcUserGroups].find(userGroup => {
						return groupAuthRule.groups.find(group => group === userGroup);
					});
				}
			});

		if (validGroup) {
			return {
				authMode,
				isOwner: false,
			};
		}

		let ownerAuthInfo: AuthorizationInfo;

		if (ownerAuthInfo!) {
			return ownerAuthInfo!;
		}

		// Owner auth needs additional values to be returned in order to create the subscription with
		// the correct parameters so we are getting the owner value from the OIDC token via the
		// identityClaim from the auth rule.

		const oidcOwnerAuthRules =
			authMode === 'oidc' || authMode === 'userPool'
				? rules.filter(
						rule =>
							rule.authStrategy === 'owner' &&
							(rule.provider === 'oidc' || rule.provider === 'userPools'),
					)
				: [];

		oidcOwnerAuthRules.forEach(ownerAuthRule => {
			const ownerValue = oidcTokenPayload?.[ownerAuthRule.identityClaim];
			const singleOwner =
				model.fields[ownerAuthRule.ownerField]?.isArray !== true;
			const isOwnerArgRequired =
				singleOwner && !ownerAuthRule.areSubscriptionsPublic;

			if (ownerValue) {
				ownerAuthInfo = {
					authMode,
					isOwner: isOwnerArgRequired,
					ownerField: ownerAuthRule.ownerField,
					ownerValue: String(ownerValue),
				};
			}
		});

		if (ownerAuthInfo!) {
			return ownerAuthInfo!;
		}

		// Fallback: return authMode or default auth type
		return {
			authMode: authMode || defaultAuthType,
			isOwner: false,
		};
	}

	private hubQueryCompletionListener(
		completed: () => void,
		capsule: HubCapsule<'datastore', { event: string }>,
	) {
		const {
			payload: { event },
		} = capsule;

		if (event === PUBSUB_CONTROL_MSG.SUBSCRIPTION_ACK) {
			completed();
		}
	}

	start(): [
		Observable<CONTROL_MSG>,
		Observable<[TransformerMutationType, SchemaModel, PersistentModel]>,
	] {
		this.runningProcesses =
			this.runningProcesses || new BackgroundProcessManager();

		const ctlObservable = new Observable<CONTROL_MSG>(observer => {
			const promises: Promise<void>[] = [];

			// Creating subs for each model/operation combo so they can be unsubscribed
			// independently, since the auth retry behavior is asynchronous.
			let subscriptions: Record<
				string,
				{
					[TransformerMutationType.CREATE]: SubscriptionLike[];
					[TransformerMutationType.UPDATE]: SubscriptionLike[];
					[TransformerMutationType.DELETE]: SubscriptionLike[];
				}
			> = {};
			let oidcTokenPayload: JwtPayload | undefined;
			let userCredentials = USER_CREDENTIALS.none;
			this.runningProcesses.add(async () => {
				try {
					// retrieving current AWS Credentials
					const credentials = (await fetchAuthSession()).tokens?.accessToken;
					userCredentials = credentials
						? USER_CREDENTIALS.auth
						: USER_CREDENTIALS.unauth;
				} catch (err) {
					// best effort to get AWS credentials
				}

				try {
					// retrieving current token info from Cognito UserPools
					const session = await fetchAuthSession();
					oidcTokenPayload = session.tokens?.idToken?.payload;
				} catch (err) {
					// best effort to get jwt from Cognito
				}

				Object.values(this.schema.namespaces).forEach(namespace => {
					Object.values(namespace.models)
						.filter(({ syncable }) => syncable)
						.forEach(
							modelDefinition =>
								this.runningProcesses.isOpen &&
								this.runningProcesses.add(async () => {
									const modelAuthModes = await getModelAuthModes({
										authModeStrategy: this.authModeStrategy,
										defaultAuthMode:
											this.amplifyConfig.aws_appsync_authenticationType,
										modelName: modelDefinition.name,
										schema: this.schema,
									});

									// subscriptions are created only based on the READ auth mode(s)
									const readAuthModes = modelAuthModes.READ;

									subscriptions = {
										...subscriptions,
										[modelDefinition.name]: {
											[TransformerMutationType.CREATE]: [],
											[TransformerMutationType.UPDATE]: [],
											[TransformerMutationType.DELETE]: [],
										},
									};

									const operations = [
										TransformerMutationType.CREATE,
										TransformerMutationType.UPDATE,
										TransformerMutationType.DELETE,
									];

									const operationAuthModeAttempts = {
										[TransformerMutationType.CREATE]: 0,
										[TransformerMutationType.UPDATE]: 0,
										[TransformerMutationType.DELETE]: 0,
									};

									const predicatesGroup = ModelPredicateCreator.getPredicates(
										this.syncPredicates.get(modelDefinition)!,
										false,
									);

									const addFilterArg = predicatesGroup !== undefined;

									// Retry subscriptions that failed for one of the following reasons:
									// 1. unauthorized - retry with next auth mode (if available)
									// 2. RTF error - retry without sending filter arg. (filtering will fall back to clientside)
									const subscriptionRetry = async (
										operation,
										addFilter = addFilterArg,
									) => {
										const {
											opType: transformerMutationType,
											opName,
											query,
											isOwner,
											ownerField,
											ownerValue,
											authMode,
										} = this.buildSubscription(
											namespace,
											modelDefinition,
											operation,
											userCredentials,
											oidcTokenPayload,
											readAuthModes[operationAuthModeAttempts[operation]],
											addFilter,
										);

										const authToken = await getTokenForCustomAuth(
											authMode,
											this.amplifyConfig,
										);

										const variables = {};

										const customUserAgentDetails: CustomUserAgentDetails = {
											category: Category.DataStore,
											action: DataStoreAction.Subscribe,
										};

										if (addFilter && predicatesGroup) {
											(variables as any).filter =
												predicateToGraphQLFilter(predicatesGroup);
										}

										if (isOwner) {
											if (!ownerValue) {
												observer.error(
													'Owner field required, sign in is needed in order to perform this operation',
												);

												return;
											}

											variables[ownerField!] = ownerValue;
										}

										logger.debug(
											`Attempting ${operation} subscription with authMode: ${
												readAuthModes[operationAuthModeAttempts[operation]]
											}`,
										);

										const queryObservable =
											this.amplifyContext.InternalAPI.graphql(
												{
													query,
													variables,
													...{ authMode },
													authToken,
												},
												undefined,
												customUserAgentDetails,
											) as unknown as Observable<
												GraphQLResult<Record<string, PersistentModel>>
											>;

										let subscriptionReadyCallback: (param?: unknown) => void;

										// TODO: consider onTerminate.then(() => API.cancel(...))

										subscriptions[modelDefinition.name][
											transformerMutationType
										].push(
											queryObservable.subscribe({
												next: result => {
													const { data, errors } = result;
													if (Array.isArray(errors) && errors.length > 0) {
														const messages = (
															errors as {
																message: string;
															}[]
														).map(({ message }) => message);

														logger.warn(
															`Skipping incoming subscription. Messages: ${messages.join(
																'\n',
															)}`,
														);

														this.drainBuffer();

														return;
													}

													const resolvedPredicatesGroup =
														ModelPredicateCreator.getPredicates(
															this.syncPredicates.get(modelDefinition)!,
															false,
														);

													const { [opName]: record } = data;

													// checking incoming subscription against syncPredicate.
													// once AppSync implements filters on subscriptions, we'll be
													// able to set these when establishing the subscription instead.
													// Until then, we'll need to filter inbound
													if (
														this.passesPredicateValidation(
															record,
															resolvedPredicatesGroup!,
														)
													) {
														this.pushToBuffer(
															transformerMutationType,
															modelDefinition,
															record,
														);
													}
													this.drainBuffer();
												},
												error: async subscriptionError => {
													const {
														errors: [{ message = '' } = {}],
													} = ({
														// eslint-disable-next-line no-empty-pattern
														errors: [],
													} = subscriptionError);

													const isRTFError =
														// only attempt catch if a filter variable was added to the subscription query
														addFilter &&
														this.catchRTFError(
															message,
															modelDefinition,
															predicatesGroup,
														);

													// Catch RTF errors
													if (isRTFError) {
														// Unsubscribe and clear subscription array for model/operation
														subscriptions[modelDefinition.name][
															transformerMutationType
														].forEach(subscription =>
															subscription.unsubscribe(),
														);

														subscriptions[modelDefinition.name][
															transformerMutationType
														] = [];

														// retry subscription connection without filter
														subscriptionRetry(operation, false);

														return;
													}

													if (
														message.includes(
															PUBSUB_CONTROL_MSG.REALTIME_SUBSCRIPTION_INIT_ERROR,
														) ||
														message.includes(
															PUBSUB_CONTROL_MSG.CONNECTION_FAILED,
														)
													) {
														// Unsubscribe and clear subscription array for model/operation
														subscriptions[modelDefinition.name][
															transformerMutationType
														].forEach(subscription =>
															subscription.unsubscribe(),
														);
														subscriptions[modelDefinition.name][
															transformerMutationType
														] = [];

														operationAuthModeAttempts[operation]++;
														if (
															operationAuthModeAttempts[operation] >=
															readAuthModes.length
														) {
															// last auth mode retry. Continue with error
															logger.debug(
																`${operation} subscription failed with authMode: ${
																	readAuthModes[
																		operationAuthModeAttempts[operation] - 1
																	]
																}`,
															);
														} else {
															// retry with different auth mode. Do not trigger
															// observer error or error handler
															logger.debug(
																`${operation} subscription failed with authMode: ${
																	readAuthModes[
																		operationAuthModeAttempts[operation] - 1
																	]
																}. Retrying with authMode: ${
																	readAuthModes[
																		operationAuthModeAttempts[operation]
																	]
																}`,
															);
															subscriptionRetry(operation);

															return;
														}
													}

													logger.warn('subscriptionError', message);

													try {
														// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
														await this.errorHandler({
															recoverySuggestion:
																'Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues',
															localModel: null!,
															message,
															model: modelDefinition.name,
															operation,
															errorType:
																getSubscriptionErrorType(subscriptionError),
															process: ProcessName.subscribe,
															remoteModel: null!,
															cause: subscriptionError,
														});
													} catch (e) {
														logger.error(
															'Subscription error handler failed with:',
															e,
														);
													}

													if (typeof subscriptionReadyCallback === 'function') {
														subscriptionReadyCallback();
													}

													if (
														message.includes('"errorType":"Unauthorized"') ||
														message.includes('"errorType":"OperationDisabled"')
													) {
														return;
													}
													observer.error(message);
												},
											}),
										);

										promises.push(
											(async () => {
												let boundFunction: any;
												let removeBoundFunctionListener: () => void;
												await new Promise(resolve => {
													subscriptionReadyCallback = resolve;
													boundFunction = this.hubQueryCompletionListener.bind(
														this,
														resolve,
													);
													removeBoundFunctionListener = Hub.listen(
														'api',
														boundFunction,
													);
												});
												removeBoundFunctionListener();
											})(),
										);
									};

									operations.forEach(op => subscriptionRetry(op));
								}),
						);
				});

				this.runningProcesses.isOpen &&
					this.runningProcesses.add(() =>
						Promise.all(promises).then(() => {
							observer.next(CONTROL_MSG.CONNECTED);
						}),
					);
			}, 'subscription processor new subscriber');

			return this.runningProcesses.addCleaner(async () => {
				Object.keys(subscriptions).forEach(modelName => {
					subscriptions[modelName][TransformerMutationType.CREATE].forEach(
						subscription => {
							subscription.unsubscribe();
						},
					);
					subscriptions[modelName][TransformerMutationType.UPDATE].forEach(
						subscription => {
							subscription.unsubscribe();
						},
					);
					subscriptions[modelName][TransformerMutationType.DELETE].forEach(
						subscription => {
							subscription.unsubscribe();
						},
					);
				});
			});
		});

		const dataObservable = new Observable<
			[TransformerMutationType, SchemaModel, PersistentModel]
		>(observer => {
			this.dataObserver = observer;
			this.drainBuffer();

			return this.runningProcesses.addCleaner(async () => {
				this.dataObserver = null!;
			});
		});

		return [ctlObservable, dataObservable];
	}

	public async stop() {
		await this.runningProcesses.close();
		await this.runningProcesses.open();
	}

	private passesPredicateValidation(
		record: PersistentModel,
		predicatesGroup: PredicatesGroup<any>,
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
		data: PersistentModel,
	) {
		this.buffer.push([transformerMutationType, modelDefinition, data]);
	}

	private drainBuffer() {
		if (this.dataObserver) {
			this.buffer.forEach(data => {
				this.dataObserver.next!(data);
			});
			this.buffer = [];
		}
	}

	/**
	 * @returns true if the service returned an RTF subscription error
	 * @remarks logs a warning with remediation instructions
	 *
	 */
	private catchRTFError(
		message: string,
		modelDefinition: SchemaModel,
		predicatesGroup: PredicatesGroup<any> | undefined,
	): boolean {
		const header =
			'Backend subscriptions filtering error.\n' +
			'Subscriptions filtering will be applied clientside.\n';

		const messageErrorTypeMap = {
			'UnknownArgument: Unknown field argument filter': RTFError.UnknownField,
			'Filters exceed maximum attributes limit': RTFError.MaxAttributes,
			'Filters combination exceed maximum limit': RTFError.MaxCombinations,
			'filter uses same fieldName multiple time': RTFError.RepeatedFieldname,
			"The variables input contains a field name 'not'": RTFError.NotGroup,
			'The variables input contains a field that is not defined for input object type':
				RTFError.FieldNotInType,
		};

		const [_errorMsg, errorType] =
			Object.entries(messageErrorTypeMap).find(([errorMsg]) =>
				message.includes(errorMsg),
			) || [];

		if (errorType !== undefined) {
			const remediationMessage = generateRTFRemediation(
				errorType,
				modelDefinition,
				predicatesGroup,
			);

			logger.warn(`${header}\n${message}\n${remediationMessage}`);

			return true;
		}

		return false;
	}
}

export { SubscriptionProcessor };
