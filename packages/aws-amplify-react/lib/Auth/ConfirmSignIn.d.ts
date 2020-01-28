import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
export interface IConfirmSignInState extends IAuthPieceState {
	mfaType: string;
}
export default class ConfirmSignIn extends AuthPiece<
	IAuthPieceProps,
	IConfirmSignInState
> {
	constructor(props: IAuthPieceProps);
	checkContact(user: any): void;
	confirm(event: any): void;
	componentDidUpdate(): void;
	showComponent(theme: any): JSX.Element;
}
