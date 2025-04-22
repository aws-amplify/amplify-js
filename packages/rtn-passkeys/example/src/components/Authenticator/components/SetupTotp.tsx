// import { confirmSignIn } from 'aws-amplify/auth';
// import { useState } from 'react';
// // import QRCode from 'react-qr-code';
// import { handleNextSignInStep } from '../utils/handleNextSignInStep';
// import { useAuthenticator } from '../hooks/useAuthenticator';
// // import { AuthError } from './AuthError';

interface SetupTotpProps {
	setupUri: string;
}
export function SetupTotp({ setupUri }: SetupTotpProps) {
	// const { dispatch } = useAuthenticator();

	// const [code, setCode] = useState('');
	// const [error, setError] = useState<Error | null>(null);

	// const handleSubmit = async (e: React.FormEvent) => {
	// 	try {
	// 		e.preventDefault();

	// 		const { nextStep } = await confirmSignIn({
	// 			challengeResponse: code,
	// 		});

	// 		handleNextSignInStep(nextStep, dispatch);
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			setError(err);
	// 		}
	// 	}
	// };

	return null;
	// <section>
	// 	<h4>Setup TOTP</h4>
	// 	<form onSubmit={handleSubmit}>
	// 		<QRCode value={setupUri} />
	// 		<input
	// 			type="text"
	// 			name="code"
	// 			placeholder="Code"
	// 			value={code}
	// 			onChange={e => setCode(e.target.value)}
	// 		/>

	// 		<button type="submit">Setup Totp</button>
	// 		{error && <AuthError error={error} />}
	// 	</form>
	// </section>
}
