import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
export default class Loading extends AuthPiece<
	IAuthPieceProps,
	IAuthPieceState
> {
	constructor(props: IAuthPieceProps);
	showComponent(theme: any): JSX.Element;
}
