import Observable from 'zen-observable-ts';
import { ModelInstanceCreator } from '../datastore/datastore';
import Storage from '../storage/storage';
import {
	ConflictHandler,
	ErrorHandler,
	InternalSchema,
	ModelInit,
	MutableModel,
	NamespaceResolver,
	PersistentModelConstructor,
	SchemaNamespace,
} from '../types';
import { TransformerMutationType } from './utils';
declare type StartParams = {
	fullSyncInterval: number;
};
export declare class MutationEvent {
	constructor(init: ModelInit<MutationEvent>);
	static copyOf(
		src: MutationEvent,
		mutator: (draft: MutableModel<MutationEvent>) => void | MutationEvent
	): MutationEvent;
	readonly id: string;
	readonly model: string;
	readonly operation: TransformerMutationType;
	readonly data: string;
	readonly modelId: string;
	readonly condition: string;
}
export declare class SyncEngine {
	private readonly schema;
	private readonly namespaceResolver;
	private readonly modelClasses;
	private readonly userModelClasses;
	private readonly storage;
	private readonly modelInstanceCreator;
	private readonly maxRecordsToSync;
	private started;
	private online;
	private processingMutations;
	private fullSyncTimeoutId;
	private readonly syncQueriesProcessor;
	private readonly subscriptionsProcessor;
	private readonly mutationsProcessor;
	private readonly modelMerger;
	private readonly outbox;
	constructor(
		schema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelClasses: Record<string, PersistentModelConstructor<any>>,
		userModelClasses: Record<string, PersistentModelConstructor<any>>,
		storage: Storage,
		modelInstanceCreator: ModelInstanceCreator,
		maxRecordsToSync: number,
		conflictHandler: ConflictHandler,
		errorHandler: ErrorHandler
	);
	start(params: StartParams): Observable<void>;
	private getModelsMetadataWithNextFullSync;
	private isFullSync;
	private waitForSyncQueries;
	private waitForSubscriptionsReady;
	private setupModels;
	private getModelsMetadata;
	private getModelMetadata;
	private getModelDefinition;
	static getNamespace(): SchemaNamespace;
}
export {};
