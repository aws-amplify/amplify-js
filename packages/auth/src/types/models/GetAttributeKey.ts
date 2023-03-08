export type GetAttributeKey<T> = T extends string ? T : `custom:${string}`;
