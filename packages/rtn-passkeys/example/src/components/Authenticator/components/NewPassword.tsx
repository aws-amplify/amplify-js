import { confirmSignIn } from 'aws-amplify/auth';
import { useState } from 'react';
import { useAuthenticator } from '../hooks/useAuthenticator';
import { handleNextSignInStep } from '../utils/handleNextSignInStep';
import { AuthError } from './AuthError';

export function NewPassword() {
	const { dispatch } = useAuthenticator();

	const [password, setPassword] = useState('');
	const [error, setError] = useState<Error | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
			const { nextStep } = await confirmSignIn({
				challengeResponse: password,
			});
			handleNextSignInStep(nextStep, dispatch);
		} catch (err) {
			if (err instanceof Error) {
				setError(err);
			}
		}
	};

	return (
		<section>
			<h4>New Password Required</h4>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					name="password"
					placeholder="Password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					data-test="new-password-input"
				/>
				<button type="submit" data-test="new-password-button">
					Submit
				</button>
				{error && <AuthError error={error} />}
			</form>
		</section>
	);
}
