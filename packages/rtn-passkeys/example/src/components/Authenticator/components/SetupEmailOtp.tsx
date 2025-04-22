import { confirmSignIn } from 'aws-amplify/auth';
import { useState } from 'react';
import { handleNextSignInStep } from '../utils/handleNextSignInStep';
import { useAuthenticator } from '../hooks/useAuthenticator';
import { AuthError } from './AuthError';

export function SetupEmailOtp() {
	const { dispatch } = useAuthenticator();
	const [email, setEmail] = useState('');
	const [error, setError] = useState<Error | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();

			const { nextStep } = await confirmSignIn({
				challengeResponse: email,
			});

			handleNextSignInStep(nextStep, dispatch);
		} catch (err) {
			if (err instanceof Error) {
				setError(err);
			}
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	return (
		<section>
			<h4>Setup Email OTP</h4>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					name="email"
					placeholder="Email"
					value={email}
					onChange={handleChange}
					data-test="email-input"
				/>
				<button type="submit" data-test="setup-email-mfa-button">
					Submit
				</button>
				{error && <AuthError error={error} />}
			</form>
		</section>
	);
}
