// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export declare const __modelMeta__: unique symbol;

export type ExtractModelMeta<T extends Record<any, any>> =
	T[typeof __modelMeta__];

type Prettify<T> = T extends object
	? {
			[P in keyof T]: Prettify<T[P]>;
	  }
	: T;

// tslint gets confused by template literal types
// tslint:disable:semicolon
type FlattenKeys<
	T extends Record<string, unknown> = {},
	Key = keyof T
> = Key extends string
	? T[Key] extends Record<string, unknown>
		? `${Key}.${FlattenKeys<T[Key]>}` | `${Key}.*`
		: `${Key}`
	: never;

type Model = Record<string, any>;
type Joined<
	M extends Model,
	Paths extends Array<FlattenKeys<M>>
> = Paths extends never[]
	? M
	: Prettify<
			{
				[k in Paths[number] | keyof M as k extends `${infer A}.${string}`
					? A
					: never]: k extends `${infer A}.${infer B}`
					? B extends `${string}.${string}`
						? Joined<M[A], B extends FlattenKeys<M[A]> ? [B] : never>
						: B extends `*`
						? M[A]
						: Pick<M[A], B>
					: never;
			} & {
				[k in Paths[number] as k extends `${string}.${string}`
					? never
					: k]: M[k];
			}
	  >;

type ModelIdentifier<Model extends Record<any, any>> = Prettify<
	Record<Model['identifier'] & string, string>
>;

export type ModelTypes<
	T extends Record<any, any>,
	ModelMeta extends Record<any, any> = ExtractModelMeta<T>
> = {
	[K in keyof T]: K extends string
		? T[K] extends Record<string, unknown>
			? {
					create: (model: T[K]) => Promise<T[K]>;
					update: (
						model: Prettify<
							{
								id: string;
							} & Partial<T[K]>
						>
					) => Promise<T[K]>;
					delete: (identifier: ModelIdentifier<ModelMeta[K]>) => Promise<T[K]>;
					get: (identifier: ModelIdentifier<ModelMeta[K]>) => Promise<T[K]>;
					list<SS extends FlattenKeys<T[K]>[]>(obj?: {
						selectionSet?: SS;
					}): Promise<Array<Joined<T[K], SS>>>;
			  }
			: never
		: never;
};
