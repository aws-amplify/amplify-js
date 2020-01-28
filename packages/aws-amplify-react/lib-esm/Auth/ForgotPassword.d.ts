import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
export interface IForgotPasswordState extends IAuthPieceState {
	delivery: any;
}
export default class ForgotPassword extends AuthPiece<
	IAuthPieceProps,
	IForgotPasswordState
> {
	constructor(props: IAuthPieceProps);
	send(): void;
	submit(): void;
	sendView(): JSX.Element;
	submitView(): JSX.Element;
	showComponent(theme: any): JSX.Element;
}
