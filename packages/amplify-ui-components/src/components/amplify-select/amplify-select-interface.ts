interface SelectOption<T> {
  label: string;
  value: T;
}

interface SelectOptions<T extends string | number> extends Array<SelectOption<T>> {}

export type SelectOptionsString = SelectOptions<string>;
export type SelectOptionsNumber = SelectOptions<number>;
