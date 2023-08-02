export declare const __modelMeta__: unique symbol;

export type ExtractModelMeta<T extends Record<any, any>> =
	T[typeof __modelMeta__];
