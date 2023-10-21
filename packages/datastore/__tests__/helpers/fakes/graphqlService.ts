import { Observable, Subscriber } from 'rxjs';
import { parse } from 'graphql';
import {
	Schema,
	SchemaModel,
	isModelAttributePrimaryKey,
	__modelMeta__,
} from '../../../src/types';
import { validatePredicate, getTimestampFields } from '../../../src/util';
import { ModelPredicateCreator } from '../../../src/predicates';
import { initSchema as _initSchema } from '../../../src/datastore/datastore';
import { pause } from '../util';

type GraphQLRequest = {
	query: string;
	variables: Record<string, any>;
	authMode: string | undefined | null;
	authToken: string | undefined | null;
};

/**
 * Artificial latencies to introduce to the imagined network boundaries.
 * @property request: The time it takes a request will take to reach the cloud.
 * @property response: After request processing, the time it takes for the client to receive a response.
 * @property subscriber: After request processing, the time it takes for each relevant subscriber to receive an event.
 * @property jitter: The max amount to randomly to +/- from each latency.
 */
type FakeLatencies = {
	request: number;
	response: number;
	subscriber: number;
	jitter: number;
};

const defaultLatencies: FakeLatencies = {
	request: 15,
	response: 15,
	subscriber: 15,
	jitter: 5,
};

/**
 * Statefully pretends to be AppSync, with minimal built-in assertions with
 * error callbacks and settings to help simulate various conditions.
 */
export class FakeGraphQLService {
	public isConnected = true;
	public log: (channel: string, ...etc: any) => void = s => undefined;
	public requests = [] as any[];
	public tables = new Map<string, Map<string, any[]>>();
	public tableDefinitions = new Map<string, SchemaModel>();
	public PKFields = new Map<string, string[]>();
	public stopSubscriptionMessages = false;
	public timestampFields = new Map<
		string,
		{ createdAt: string; updatedAt: string }
	>();
	public observers = new Map<string, Subscriber<any>[]>();
	/**
	 * All in-flight mutations. Used solely for observability in tests.
	 * When dealing with concurrent mutations or increased latency,
	 * we should always first verify that there are no in-flight
	 * mutations prior to making final test assertions.
	 */
	public runningMutations = new Map<string, string>();

	/**
	 * Number of subscription messages sent. Used solely for observability
	 * in tests. When dealing with concurrent mutations or increased latency,
	 * we should always first verify that the number of subscription messages
	 * sent for a given model is what we expect prior to making final test
	 * assertions.
	 */
	public subscriptionMessagesSent = [] as any[];

	/**
	 * Singleton middleware, basically.
	 */
	public intercept: (request: GraphQLRequest, next: () => any) => any = (
		request,
		next
	) => next();

	/**
	 * Artificial latencies to introduce to the imagined network boundaries.
	 */
	public latencies: FakeLatencies = defaultLatencies;

	constructor(public schema: Schema) {
		for (const model of Object.values(schema.models)) {
			this.tables.set(model.name, new Map<string, any[]>());
			this.tableDefinitions.set(model.name, model);
			let CPKFound = false;
			for (const attribute of model.attributes || []) {
				if (isModelAttributePrimaryKey(attribute)) {
					this.PKFields.set(model.name, attribute!.properties!.fields);
					CPKFound = true;
					break;
				}
			}

			const timestamps = getTimestampFields(model);
			this.timestampFields.set(model.name, timestamps);

			if (!CPKFound) {
				this.PKFields.set(model.name, ['id']);
			}
		}
	}

	/**
	 * NOTE: don't forget to reset these values at the end of your test!
	 * @param latencies new values for fake latencies
	 * @returns updated values for fake latencies
	 */
	public setLatencies(latencies: Partial<FakeLatencies>): FakeLatencies {
		return (this.latencies = { ...this.latencies, ...latencies });
	}

	/**
	 * Helpful for debugging tests that update latencies
	 * @returns current values for fake latencies
	 */
	public getLatencies(): FakeLatencies {
		return this.latencies;
	}

	private async jitteredPause(ms) {
		/**
		 * "Materialized" jitter from -jitter to +jitter.
		 */
		const jitter = Math.floor(
			Math.random() * this.latencies.jitter * 2 - this.latencies.jitter
		);
		const jitteredMs = Math.max(ms + jitter, 0);
		return pause(jitteredMs);
	}

	/**
	 * Given the plural name of a model, find the singular name
	 * @param pluralName plural name of model (e.g. "Todos")
	 * @returns singular name of model (e.g. "Todo")
	 */
	private findSingularName(pluralName: string): string {
		const model = Object.values(this.schema.models).find(
			m => m.pluralName === pluralName
		);
		if (!model) throw new Error(`No model found for plural name ${pluralName}`);
		return model.name;
	}

	public parseQuery(query) {
		const q = (parse(query) as any).definitions[0];

		this.log('RequestAST', JSON.stringify(q, null, 2));

		const operation = q.operation;
		const name = q.name.value;
		const selections = q.selectionSet.selections[0];
		const selection = selections.name.value;
		const type = selection.match(
			/^(create|update|delete|sync|get|list|onCreate|onUpdate|onDelete)(\w+)$/
		)[1];

		let table;
		// `selection` here could be `syncTodos` or `syncCompositePKChildren`
		if (type === 'sync' || type === 'list') {
			// e.g. `Models`
			const pluralName = selection.match(
				/^(create|sync|get|list)([A-Za-z]+)$/
			)[2];
			table = this.findSingularName(pluralName);
		} else {
			table = selection.match(
				/^(create|update|delete|sync|get|list|onCreate|onUpdate|onDelete)(\w+)$/
			)[2];
		}

		const items =
			operation === 'query'
				? selections?.selectionSet?.selections[0]?.selectionSet?.selections?.map(
						i => i.name.value
				  )
				: selections?.selectionSet?.selections?.map(i => i.name.value);

		return { operation, name, selection, type, table, items };
	}

	public satisfiesCondition(tableName, item, condition) {
		this.log('checking satisfiesCondition', {
			tableName,
			item,
			condition: JSON.stringify(condition),
		});

		if (!condition) {
			this.log(
				'checking satisfiesCondition',
				'matches all for `null` conditions'
			);
			return true;
		}

		const modelDefinition = this.schema.models[tableName];
		const predicate = ModelPredicateCreator.createFromAST(
			modelDefinition,
			condition
		);
		const isMatch = validatePredicate(item, 'and', [
			ModelPredicateCreator.getPredicates(predicate)!,
		]);

		this.log('satisfiesCondition result', {
			effectivePredicate: JSON.stringify(
				ModelPredicateCreator.getPredicates(predicate)
			),
			isMatch,
		});

		return isMatch;
	}

	public subscribe(tableName, type, observer) {
		this.getObservers(tableName, type.substring(2))!.push(observer);
	}

	public getObservers(tableName, type) {
		const triggerName = `${tableName}.${type.toLowerCase()}`;
		if (!this.observers.has(triggerName)) this.observers.set(triggerName, []);
		return this.observers.get(triggerName) || [];
	}

	public getTable(name): Map<string, any> {
		if (!this.tables.has(name)) this.tables.set(name, new Map<string, any[]>());
		return this.tables.get(name)!;
	}

	public getPK(table, instance): string {
		const pkfields = this.PKFields.get(table)!;
		const values = pkfields.map(k => instance[k]);
		return JSON.stringify(values);
	}

	private makeConditionalUpdateFailedError(selection) {
		// Reponse taken from AppSync console trying to create already existing model.
		return {
			path: [selection],
			data: null,
			errorType: 'ConditionalCheckFailedException',
			errorInfo: null,
			locations: [
				{
					line: 12,
					column: 3,
					sourceName: null,
				},
			],
			message:
				'The conditional request failed (Service: DynamoDb, Status Code: 400, Request ID: 123456789123456789012345678901234567890)',
		};
	}

	private makeMissingUpdateTarget(selection) {
		// Response from AppSync console on non-existent model.
		return {
			path: [selection],
			data: null,
			errorType: 'Unauthorized',
			errorInfo: null,
			locations: [
				{
					line: 12,
					column: 3,
					sourceName: null,
				},
			],
			message: `Not Authorized to access ${selection} on type Mutation`,
		};
	}

	private makeMissingVersion(data, selection) {
		return {
			path: [selection],
			data,
			errorType: 'ConflictUnhandled',
			errorInfo: null,
			locations: [
				{
					line: 20,
					column: 3,
					sourceName: null,
				},
			],
			message: 'Conflict resolver rejects mutation.',
		};
	}

	private makeExtraFieldInputError(tableName, operation, fields) {
		const properOperationName = `${operation[0].toUpperCase()}${operation.substring(
			1
		)}`;
		const inputName = `${properOperationName}${tableName}Input`;
		return {
			data: null,
			errors: fields.map(field => ({
				path: null,
				locations: null,
				message: `The variables input contains a field name '${field}' that is not defined for input object type '${inputName}'`,
			})),
		};
	}

	private makeOwnerFieldNullInputError(tableName, operation) {
		// Response from AppSync console on non-existent model.
		return {
			path: [operation],
			data: null,
			errorType: 'Unauthorized',
			errorInfo: null,
			locations: [
				{
					line: 12,
					column: 3,
					sourceName: null,
				},
			],
			message: `Not Authorized to access ${operation} on type ${tableName}`,
		};
	}

	private disconnectedError() {
		return {
			data: {},
			errors: [
				{
					message: 'Network Error',
				},
			],
		};
	}

	private ownerFields(tableName) {
		const def = this.tableDefinitions.get(tableName)!;
		const auth = def.attributes?.find(a => a.type === 'auth');
		const ownerFields = auth?.properties?.rules
			.map(rule => rule.ownerField)
			.filter(f => f);

		return ownerFields || ['owner'];
	}

	private writeableFields(tableName) {
		const def = this.tableDefinitions.get(tableName)!;
		return Object.keys(def.fields).filter(
			field => !def.fields[field]?.isReadOnly
		);
	}

	private identifyExtraValues(expected, actual) {
		const extraValues: string[] = [];
		for (const v of actual) {
			if (!expected.includes(v)) {
				extraValues.push(v);
			}
		}

		return extraValues;
	}

	private validate(tableName, operation, record) {
		// very simple validation for an observed *near*-regression from a PR right now.
		// https://github.com/aws-amplify/amplify-js/pull/10915
		const writeableFields = this.writeableFields(tableName);

		let error: any;

		switch (operation) {
			case 'create':
			case 'update':
				const unexpectedFields = this.identifyExtraValues(
					[...writeableFields, '_version'],
					Object.keys(record)
				);
				if (unexpectedFields.length > 0) {
					error = this.makeExtraFieldInputError(
						tableName,
						operation,
						unexpectedFields
					);
				}
				for (const ownerField of this.ownerFields(tableName)) {
					if (record[ownerField] === null) {
						error = this.makeOwnerFieldNullInputError(tableName, operation);
						break;
					}
				}
				break;
			case 'delete':
				break;
			default:
				// this is not a GraphQL error. it likely indicates our fake graphql
				// service is broken.
				throw new Error('Invalid operation. Should be unreachable.');
		}

		this.log('validate', {
			tableName,
			operation,
			record,
			error,
		});

		return error;
	}

	private populatedFields(record) {
		return Object.fromEntries(
			Object.entries(record).filter(([key, value]) => value !== undefined)
		);
	}

	private autoMerge(existing, updated) {
		let merged;
		if (updated._version >= existing._version) {
			merged = {
				...this.populatedFields(existing),
				...this.populatedFields(updated),
				_version: updated._version + 1,
				_lastChangedAt: new Date().getTime(),
				updatedAt: new Date().toISOString(),
			};
		} else {
			merged = {
				...this.populatedFields(updated),
				...this.populatedFields(existing),
				_version: existing._version + 1,
				_lastChangedAt: new Date().getTime(),
			};
		}
		this.log('auto-merge', { existing, updated, merged });
		return merged;
	}

	public simulateDisconnect() {
		this.isConnected = false;
	}

	public simulateConnect() {
		this.isConnected = true;
	}

	/*
	 * Simulate disruption by stopping subscription messages
	 */
	public simulateDisruption() {
		this.stopSubscriptionMessages = true;
	}

	public simulateDisruptionEnd() {
		this.stopSubscriptionMessages = false;
	}

	/**
	 * Sends out graphql subscription messages to all subscribers of a table-operation.
	 *
	 * @param tableName The table name subscribers are looking at.
	 * @param type The operation type. (Create, Update, Delete).
	 * @param data The data to send out.
	 * @param selection The function/selection name, like "onCreateTodo".
	 * @param ignoreLatency Used for exact control of the timing of the request / response, while still
	 * maintaining the artificial latencies of all other in-flight requests. When simulating a request from
	 * an external client, we want the response back ASAP in order to accurately test outbox merging consistently.
	 */
	public async notifySubscribers(
		tableName,
		type,
		data,
		selection,
		ignoreLatency = false
	) {
		!ignoreLatency && (await this.jitteredPause(this.latencies.subscriber));
		const observers = this.getObservers(tableName, type);
		const typeName = {
			create: 'Create',
			update: 'Update',
			delete: 'Delete',
		}[type];
		const observerMessageName = `on${typeName}${tableName}`;
		observers.forEach(observer => {
			const message = {
				data: {
					[observerMessageName]: data[selection],
				},
			};
			if (!this.stopSubscriptionMessages) {
				this.log('API subscription message', {
					observerMessageName,
					message,
				});
				this.subscriptionMessagesSent.push([observerMessageName, message]);
				observer.next(message);
			}
		});
	}

	public graphql(request: GraphQLRequest, ignoreLatency: boolean = false) {
		return this.intercept(request, () => this.request(request, ignoreLatency));
	}

	/**
	 * For making direct calls to the service without DataStore (e.g. simulating requests from external clients).
	 * Wrapping `this.graphql` offers a quick and easy way to quickly debug tests that makes external calls
	 * without having to filter out all calls to `this.graphql`.
	 * @param request the GraphQL request
	 * @param ignoreLatency Used for exact control of the timing of the request / response, while still
	 * maintaining the artificial latencies of all other in-flight requests. When simulating a request from
	 * an external client, we want the response back ASAP in order to accurately test outbox merging consistently.
	 */
	public externalGraphql(request: GraphQLRequest, ignoreLatency = false) {
		this.log('External request', {
			request,
		});
		return this.graphql(request, ignoreLatency);
	}

	public request(
		{ query, variables, authMode, authToken },
		ignoreLatency = false
	) {
		this.log('API Request', {
			query,
			variables: JSON.stringify(variables, null, 2),
			authMode,
			authToken,
		});

		if (!this.isConnected) {
			return this.disconnectedError();
		}

		const parsed = this.parseQuery(query);
		const { operation, selection, table: tableName, type } = parsed;

		this.log('Parsed Request', parsed);

		this.requests.push({
			query,
			variables,
			authMode,
			authToken,
			operation,
			tableName,
			type,
		});
		let data;
		let errors = [] as any;

		const table = this.getTable(tableName);

		// API returns immediately if the operation is a subscription.
		// if the subscription fails or is delayed, that will simply manifest as either
		// errors or missed messages, respective -- neither of which we're testing yet.
		// TBD how we simulate that.
		if (operation === 'subscription') {
			return new Observable(observer => {
				this.log('API subscription created', { tableName, type });
				this.subscribe(tableName, type, observer);
				// needs to send messages like `{ value: { data: { [opname]: record }, errors: [] } }`
			});
		}

		return new Promise(async resolve => {
			!ignoreLatency && (await this.jitteredPause(this.latencies.request));

			if (operation === 'query') {
				if (type === 'get') {
					const record = table.get(this.getPK(tableName, variables.input));
					data = { [selection]: record };
				} else if (type === 'list' || type === 'sync') {
					data = {
						[selection]: {
							items: [...table.values()].filter(item =>
								this.satisfiesCondition(tableName, item, variables.filter)
							),
							nextToken: null,
							startedAt: new Date().getTime(),
						},
					};
				}
			} else if (operation === 'mutation') {
				this.runningMutations.set(variables.input.id, type);

				const record = variables.input;
				// TODO: update test expected values and re-enable (currently unused)
				// const timestampFields = this.timestampFields.get(tableName);

				if (type === 'create') {
					const existing = table.get(this.getPK(tableName, record));
					const validationError = this.validate(tableName, 'create', record);

					if (validationError) {
						data = {
							[selection]: null,
						};
						errors = [validationError];
					} else if (existing) {
						data = {
							[selection]: null,
						};
						errors = [this.makeConditionalUpdateFailedError(selection)];
					} else {
						data = {
							[selection]: {
								...record,
								_deleted: false,
								_version: 1,
								_lastChangedAt: new Date().getTime(),
								// TODO: update test expected values and re-enable
								// [timestampFields!.createdAt]: new Date().toISOString(),
								// [timestampFields!.updatedAt]: new Date().toISOString(),
							},
						};
						table.set(this.getPK(tableName, record), data[selection]);
					}
				} else if (type === 'update') {
					// Simulate update using the default (AUTO_MERGE) for now.
					// NOTE: We're not doing list/set merging. :o
					const existing = table.get(this.getPK(tableName, record));
					const validationError = this.validate(tableName, 'update', record);
					if (validationError) {
						data = {
							[selection]: null,
						};
						errors = [validationError];
					} else if (!existing) {
						data = {
							[selection]: null,
						};
						errors = [this.makeMissingUpdateTarget(selection)];
					} else {
						const updated = this.autoMerge(existing, record);
						data = {
							[selection]: updated,
						};
						table.set(this.getPK(tableName, record), updated);
					}
				} else if (type === 'delete') {
					const existing = table.get(this.getPK(tableName, record));
					const validationError = this.validate(tableName, 'delete', record);
					this.log('delete looking for existing', { existing });

					if (validationError) {
						data = {
							[selection]: null,
						};
						errors = [validationError];
					} else if (!existing) {
						data = {
							[selection]: null,
						};
						errors = [this.makeMissingUpdateTarget(selection)];
					} else if (record._version === undefined) {
						data = {
							[selection]: null,
						};
						errors = [this.makeMissingVersion(existing, selection)];
					} else if (existing._version !== record._version) {
						data = {
							[selection]: null,
						};
						errors = [this.makeConditionalUpdateFailedError(selection)];
					} else if (
						!this.satisfiesCondition(tableName, existing, variables.condition)
					) {
						data = {
							[selection]: null,
						};
						errors = [this.makeConditionalUpdateFailedError(selection)];
					} else {
						data = {
							[selection]: {
								...existing,
								...record,
								_deleted: true,
								_version: existing._version + 1,
								_lastChangedAt: new Date().getTime(),
								// TODO: update test expected values and re-enable
								// [timestampFields!.updatedAt]: new Date().toISOString(),
							},
						};
						table.set(this.getPK(tableName, record), data[selection]);
						this.log('delete applying to table', { data });
					}
				}

				this.notifySubscribers(tableName, type, data, selection, ignoreLatency);

				!ignoreLatency && (await this.jitteredPause(this.latencies.response));

				this.log('API Response', { data, errors });
				resolve({
					data,
					errors,
					extensions: {},
				});
			}

			!ignoreLatency && (await this.jitteredPause(this.latencies.response));

			// Mutation is complete, remove from in-flight mutations
			this.runningMutations.delete(variables?.input?.id);

			this.log('API Response', { data, errors });
			resolve({
				data,
				errors,
				extensions: {},
			});
		});
	}
}
