declare interface Document {
	exitFullscreen: () => void;
	mozCancelFullScreen: () => void;
	webkitExitFullscreen: () => void;
	fullscreenElement: () => void;
	mozFullScreenElement: () => void;
	webkitFullscreenElement: () => void;
}

declare interface Window {
	amazon: any;
	auth0: any;
	auth0_client: any;
	FB: any;
	fbAsyncInit: any;
	gapi: any;
}
