import * as React from 'react';
interface IPhoneFieldProps {
	defaultDialCode?: string;
	label?: string;
	onChangeText: (string: any) => void;
	placeholder?: string;
	required?: boolean;
	theme?: any;
}
interface IPhoneFieldState {}
declare class PhoneField extends React.Component<
	IPhoneFieldProps,
	IPhoneFieldState
> {
	private inputs;
	constructor(props: any);
	composePhoneNumber(dial_code: any, phone_line_number: any): string;
	handleInputChange(evt: any): void;
	render(): JSX.Element;
}
export { PhoneField };
export default PhoneField;
