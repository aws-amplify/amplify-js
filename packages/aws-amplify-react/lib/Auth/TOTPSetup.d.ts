import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
export default class TOTPSetup extends AuthPiece<
	IAuthPieceProps,
	IAuthPieceState
> {
	constructor(props: IAuthPieceProps);
	checkContact(user: any): void;
	onTOTPEvent(event: any, data: any, user: any): void;
	showComponent(theme: any): JSX.Element;
}
