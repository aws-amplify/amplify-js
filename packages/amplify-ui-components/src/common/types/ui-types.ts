export interface InputEvent extends Event {}
export type TextFieldTypes =
	| 'date'
	| 'email'
	| 'number'
	| 'password'
	| 'search'
	| 'tel'
	| 'text'
	| 'url'
	| 'time';
export type ButtonTypes = 'button' | 'submit' | 'reset';
export type ButtonVariant = 'button' | 'anchor' | 'icon';
