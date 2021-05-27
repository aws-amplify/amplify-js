interface SelectOption<T> {
	label: string;
	value: T;
}

interface SelectOptions<T extends string | number>
	extends Array<SelectOption<T>> {}

export type SelectOptionsString = SelectOptions<string>;
export type SelectOptionsNumber = SelectOptions<number>;

export type SelectOptionString = SelectOption<string>;
export type SelectOptionNumber = SelectOption<number>;
