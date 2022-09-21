import Link from 'next/link';

function CognitoSignInPlugin() {
	async function handleSignIn() {
		try {
			const Auth = (await import('aws-amplify')).Auth;
			const result = await Auth.signIn('username', 'password');
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div>
			<h1>sign in with CognitoSignIn provider</h1>
			<button onClick={() => handleSignIn()}>sign in</button>
			<Link href="/signup">
				<a>go to sign up</a>
			</Link>
		</div>
	);
}

export default CognitoSignInPlugin;
