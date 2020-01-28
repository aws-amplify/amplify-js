import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
export interface ISignInProps extends IAuthPieceProps {
	federated?: any;
	override?: any;
}
export interface ISignInState extends IAuthPieceState {
	loading?: boolean;
}
export default class SignIn extends AuthPiece<ISignInProps, ISignInState> {
	constructor(props: ISignInProps);
	checkContact(user: any): void;
	signIn(event: any): Promise<void>;
	showComponent(theme: any): JSX.Element;
}
