import Observable from 'zen-observable-ts';
import {
	InternalSchema,
	ModelInstanceMetadata,
	SchemaModel,
} from '../../types';
declare class SyncProcessor {
	private readonly schema;
	private readonly maxRecordsToSync;
	private readonly typeQuery;
	constructor(schema: InternalSchema, maxRecordsToSync?: number);
	private generateQueries;
	private retrievePage;
	private jitteredRetry;
	start(
		typesLastSync: Map<SchemaModel, [string, number]>
	): Observable<SyncModelPage>;
}
export declare type SyncModelPage = {
	namespace: string;
	modelDefinition: SchemaModel;
	items: ModelInstanceMetadata[];
	startedAt: number;
	done: boolean;
	isFullSync: boolean;
};
export { SyncProcessor };
