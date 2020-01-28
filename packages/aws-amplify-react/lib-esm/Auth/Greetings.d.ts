import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
export interface IGreetingsProps extends IAuthPieceProps {
	federated?: any;
	inGreeting?: string;
	outGreeting?: string;
}
export interface IGreetingsState extends IAuthPieceState {
	authData?: any;
	authState?: string;
	stateFromStorage?: boolean;
}
export default class Greetings extends AuthPiece<
	IGreetingsProps,
	IGreetingsState
> {
	private _isMounted;
	constructor(props: IGreetingsProps);
	componentDidMount(): void;
	componentWillUnmount(): void;
	findState(): void;
	onHubCapsule(capsule: any): void;
	inGreeting(name: any): string;
	outGreeting(): string;
	userGreetings(theme: any): JSX.Element;
	renderSignOutButton(): JSX.Element;
	noUserGreetings(theme: any): JSX.Element;
	render(): JSX.Element;
}
