import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
export default class RequireNewPassword extends AuthPiece<
	IAuthPieceProps,
	IAuthPieceState
> {
	constructor(props: IAuthPieceProps);
	checkContact(user: any): void;
	change(): void;
	showComponent(theme: any): JSX.Element;
}
