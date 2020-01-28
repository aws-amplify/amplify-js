export default class GoogleOAuth {
	initialized: boolean;
	constructor();
	refreshGoogleToken(): Promise<unknown>;
	private _refreshGoogleTokenImpl;
}
