import { Auth, API } from 'aws-amplify';

/**
 * For SSR adaption and/or adaption in other contexts. Perhaps a test context.
 */

export type Context = {
	// maybe just redefine the types we need here.
	Auth: typeof Auth;
	API: typeof API;
};

/**
 *
 *
 * The more experimental stuff starts here.
 *
 *
 */

export enum ObservableOperation {
	Create = 'Create',
	Update = 'Update',
	Delete = 'Delete',
}

export type ModelOp<Model> = {
	op: ObservableOperation;
	value: Model;
};

// as examples. can expand.
export type FieldType<T> = (init: any) => T;

export type Fields = Record<string, FieldType<any>>;

export type Shape<T extends Fields> = {
	name: string;
	fields: T;
};

export type ModelOf<SHAPE> = SHAPE extends Shape<infer T>
	? ModelOfFields<T>
	: never;

export type ModelOfFields<SHAPE extends Fields> = {
	[K in keyof SHAPE]: ReturnType<SHAPE[K]>;
};

export type PageOf<SHAPE extends Fields> = {
	items: ModelOfFields<SHAPE>[];
	nextToken: any;
};
