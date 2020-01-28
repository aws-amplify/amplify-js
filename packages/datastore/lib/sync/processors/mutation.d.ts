import Observable from 'zen-observable-ts';
import { MutationEvent } from '../';
import { ModelInstanceCreator } from '../../datastore/datastore';
import Storage from '../../storage/storage';
import {
	ConflictHandler,
	ErrorHandler,
	InternalSchema,
	PersistentModel,
	PersistentModelConstructor,
	SchemaModel,
} from '../../types';
import { MutationEventOutbox } from '../outbox';
import { TransformerMutationType } from '../utils';
declare class MutationProcessor {
	private readonly schema;
	private readonly storage;
	private readonly userClasses;
	private readonly outbox;
	private readonly modelInstanceCreator;
	private readonly MutationEvent;
	private readonly conflictHandler?;
	private readonly errorHandler?;
	private observer;
	private readonly typeQuery;
	private processing;
	constructor(
		schema: InternalSchema,
		storage: Storage,
		userClasses: {
			[modelName: string]: PersistentModelConstructor<PersistentModel>;
		},
		outbox: MutationEventOutbox,
		modelInstanceCreator: ModelInstanceCreator,
		MutationEvent: PersistentModelConstructor<MutationEvent>,
		conflictHandler?: ConflictHandler,
		errorHandler?: ErrorHandler
	);
	private generateQueries;
	private isReady;
	start(): Observable<[TransformerMutationType, SchemaModel, PersistentModel]>;
	resume(): Promise<void>;
	private jitteredRetry;
	private createQueryVariables;
	private opTypeFromTransformerOperation;
	pause(): void;
}
export { MutationProcessor };
