import Observable from 'zen-observable-ts';
import {
	DataStoreConfig,
	ModelInit,
	ModelInstanceMetadata,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	ProducerModelPredicate,
	Schema,
	SubscriptionMessage,
} from '../types';
declare const initSchema: (
	userSchema: Schema
) => {
	[modelName: string]: PersistentModelConstructor<any>;
};
export declare type ModelInstanceCreator = typeof modelInstanceCreator;
declare function modelInstanceCreator<
	T extends PersistentModel = PersistentModel
>(
	modelConstructor: PersistentModelConstructor<T>,
	init: ModelInit<T> & Partial<ModelInstanceMetadata>
): T;
declare function configure(config?: DataStoreConfig): void;
declare function clear(): Promise<void>;
declare const dataStore: {
	query: {
		<
			T extends Readonly<
				{
					id: string;
				} & Record<string, any>
			>
		>(
			modelConstructor: PersistentModelConstructor<T>,
			id: string
		): Promise<T>;
		<
			T_1 extends Readonly<
				{
					id: string;
				} & Record<string, any>
			>
		>(
			modelConstructor: PersistentModelConstructor<T_1>,
			criteria?: ProducerModelPredicate<T_1>,
			pagination?: PaginationInput
		): Promise<T_1[]>;
	};
	save: <
		T_2 extends Readonly<
			{
				id: string;
			} & Record<string, any>
		>
	>(
		model: T_2,
		condition?: ProducerModelPredicate<T_2>
	) => Promise<T_2[]>;
	delete: {
		<
			T_3 extends Readonly<
				{
					id: string;
				} & Record<string, any>
			>
		>(
			model: T_3,
			condition?: ProducerModelPredicate<T_3>
		): Promise<T_3>;
		<
			T_4 extends Readonly<
				{
					id: string;
				} & Record<string, any>
			>
		>(
			modelConstructor: PersistentModelConstructor<T_4>,
			id: string
		): Promise<T_4>;
		<
			T_5 extends Readonly<
				{
					id: string;
				} & Record<string, any>
			>
		>(
			modelConstructor: PersistentModelConstructor<T_5>,
			condition: ProducerModelPredicate<T_5>
		): Promise<T_5[]>;
	};
	observe: {
		(): Observable<SubscriptionMessage<any>>;
		<
			T_6 extends Readonly<
				{
					id: string;
				} & Record<string, any>
			>
		>(
			obj: T_6
		): Observable<SubscriptionMessage<T_6>>;
		<
			T_7 extends Readonly<
				{
					id: string;
				} & Record<string, any>
			>
		>(
			modelConstructor: PersistentModelConstructor<T_7>,
			id: string
		): Observable<SubscriptionMessage<T_7>>;
		<
			T_8 extends Readonly<
				{
					id: string;
				} & Record<string, any>
			>
		>(
			modelConstructor: PersistentModelConstructor<T_8>
		): Observable<SubscriptionMessage<T_8>>;
		<
			T_9 extends Readonly<
				{
					id: string;
				} & Record<string, any>
			>
		>(
			modelConstructor: PersistentModelConstructor<T_9>,
			criteria: ProducerModelPredicate<T_9>
		): Observable<SubscriptionMessage<T_9>>;
	};
	configure: typeof configure;
	clear: typeof clear;
};
export { initSchema, dataStore };
