import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
export interface ISignOutProps extends IAuthPieceProps {
	googleSignOut?: any;
	facebookSignOut?: any;
	amazonSignOut?: any;
	auth0SignOut?: any;
	stateFromStorage?: any;
}
export interface ISignOutState extends IAuthPieceState {
	authData?: any;
	authState?: any;
	stateFromStorage?: any;
}
export default class SignOut extends AuthPiece<ISignOutProps, ISignOutState> {
	_isMounted: boolean;
	constructor(props: ISignOutProps);
	componentDidMount(): void;
	componentWillUnmount(): void;
	findState(): void;
	onHubCapsule(capsule: any): void;
	signOut(): void;
	render(): JSX.Element;
}
