// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export declare const __modelMeta__: unique symbol;

export type ExtractModelMeta<T extends Record<any, any>> =
	T[typeof __modelMeta__];

type Prettify<T> = T extends () => {}
	? () => ReturnType<T>
	: T extends object
	? { [P in keyof T]: Prettify<T[P]> }
	: T;

type Model = Record<string, any>;

type Joined<
	M extends Model,
	Paths extends Array<FlattenKeys<FlatSchema<M>>>
> = Paths extends never[]
	? M
	: Prettify<
			{
				[k in Paths[number] | keyof M as k extends `${infer A}.${string}`
					? A
					: never]: k extends `${infer A}.${infer B}`
					? B extends `${string}.${string}`
						? Joined<
								M[A],
								B extends FlattenKeys<FlatSchema<M[A]>> ? [B] : never
						  >
						: B extends `*`
						? FlatSchema<M[A], false>
						: Pick<FlatSchema<M[A], false>, B>
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

// All required fields and relational fields
type MutationInput<
	Fields,
	ModelMeta extends Record<any, any>,
	Relationships = ModelMeta['relationships']
> = {
	[Prop in keyof Fields as Fields[Prop] extends () => {}
		? never
		: Prop]: Fields[Prop];
} & {
	[RelatedModel in keyof Relationships]: Relationships[RelatedModel];
};

type ArrElementOrElement<ArrType> =
	ArrType extends readonly (infer ElementType)[] ? ElementType : ArrType;

type FlatSchema<T, FlattenArray = true> = T extends () => {}
	? FlattenArray extends true
		? ArrElementOrElement<Awaited<ReturnType<T>>>
		: Awaited<ReturnType<T>>
	: T extends object
	? { [P in keyof T]: FlatSchema<T[P]> }
	: T;

type FlattenKeys<
	T extends Record<string, unknown> = {},
	Key = keyof T
> = Key extends string
	? T[Key] extends Record<string, unknown>
		? `${Key}.${FlattenKeys<T[Key]>}` | `${Key}.*`
		: `${Key}`
	: never;

export type ModelTypes<
	T extends Record<any, any>,
	ModelMeta extends Record<any, any> = ExtractModelMeta<T>,
	Flat extends Record<any, any> = FlatSchema<T>
> = {
	[K in keyof T]: K extends string
		? T[K] extends Record<string, unknown>
			? {
					create: (
						model: Prettify<MutationInput<T[K], ModelMeta[K]>>
					) => Promise<T[K]>;
					update: (
						model: Prettify<
							ModelIdentifier<ModelMeta[K]> &
								Partial<MutationInput<T[K], ModelMeta[K]>>
						>
					) => Promise<T[K]>;
					delete: (identifier: ModelIdentifier<ModelMeta[K]>) => Promise<T[K]>;
					get<SS extends FlattenKeys<Flat[K]>[] = never[]>(
						identifier: ModelIdentifier<ModelMeta[K]>,
						options?: { selectionSet?: SS }
					): Promise<T[K]>;
					list<SS extends FlattenKeys<Flat[K]>[] = never[]>(options?: {
						// TODO: strongly type filter
						filter?: {};
						selectionSet?: SS;
					}): Promise<Array<Joined<T[K], SS>>>;

					// using this to debug types (surfacing them to the app code for inspection) - not callable at runtime
					_debug(): Prettify<MutationInput<T[K], ModelMeta[K]>>;
			  }
			: never
		: never;
};
