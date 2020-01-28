import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
export default class ConfirmSignUp extends AuthPiece<
	IAuthPieceProps,
	IAuthPieceState
> {
	constructor(props: IAuthPieceProps);
	confirm(): void;
	resend(): void;
	showComponent(theme: any): JSX.Element;
}
