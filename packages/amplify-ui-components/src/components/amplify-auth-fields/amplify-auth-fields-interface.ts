import { FunctionalComponent } from '@stencil/core';

export interface FormFieldType {
  type: string;
  label?: string;
  placeholder?: string;
  hint?: string | FunctionalComponent | null;
  required?: boolean;
  handleInputChange?: (inputEvent: Event) => void;
  value?: string;
}

export interface FormFieldTypes extends Array<FormFieldType> { }
