const authModule = {
	Auth: {
		signIn: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
		signUp: () => {
			return new Promise((resolve, reject) => {
				resolve({ username: 'fakename' });
			});
		},
		confirmSignIn: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
		confirmSignUp: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
		completeNewPassword: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
		forgotPassword: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
		forgotPasswordSubmit: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
		signOut: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
		currentAuthenticatedUser: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
		setAuthState: () => {
			return 1;
		},
	},
};

const interactionsModule = {
	Interactions: {
		onComplete: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
		send: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
	},
};

const storageModule = {
	Storage: {
		put: () => {
			return new Promise((resolve, reject) => {
				resolve(1);
			});
		},
	},
};

export { authModule, interactionsModule, storageModule };
