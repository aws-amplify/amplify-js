import { FunctionalComponent } from '@stencil/state-tunnel/dist/types/stencil.core';

export interface FormFieldType {
  type: string;
  label?: string;
  placeholder?: string;
  hint?: string | FunctionalComponent | null; 
  required?: boolean;
}

export interface FormFieldTypes extends Array<FormFieldType> {};
