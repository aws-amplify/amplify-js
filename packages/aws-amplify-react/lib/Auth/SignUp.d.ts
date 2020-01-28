import * as React from 'react';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { ISignUpField } from './common/default-sign-up-fields';
export interface ISignUpConfig {
	defaultCountryCode?: number | string;
	header?: string;
	hideAllDefaults?: boolean;
	hiddenDefaults?: string[];
	signUpFields?: ISignUpField[];
}
export interface ISignUpProps extends IAuthPieceProps {
	signUpConfig?: ISignUpConfig;
}
export default class SignUp extends AuthPiece<ISignUpProps, IAuthPieceState> {
	defaultSignUpFields: ISignUpField[];
	header: string;
	signUpFields: ISignUpField[];
	constructor(props: ISignUpProps);
	validate(): any[];
	sortFields(): void;
	needPrefix(key: any): boolean;
	getDefaultDialCode(): string;
	checkCustomSignUpFields(): boolean;
	signUp(): void;
	showComponent(theme: any): React.ReactNode;
}
