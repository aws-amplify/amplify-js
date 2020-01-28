export default class FacebookOAuth {
	initialized: boolean;
	constructor();
	refreshFacebookToken(): Promise<unknown>;
	private _refreshFacebookTokenImpl;
}
