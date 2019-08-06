interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectOptions extends Array<SelectOption> {}
