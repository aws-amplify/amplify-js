function SignInMachine() {
	async function handleSignIn() {
		try {
			const Auth = (await import('aws-amplify')).AuthPluggable;
			const result = await Auth.signIn({
				username: 'username',
				signInType: 'Password',
			});
			console.log(result);
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div>
			<h1>sign in with CognitoProvider</h1>
			<button onClick={() => handleSignIn()}>sign in</button>
		</div>
	);
}

export default SignInMachine;
