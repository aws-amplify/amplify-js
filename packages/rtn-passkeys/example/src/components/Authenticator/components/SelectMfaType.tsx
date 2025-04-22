import { confirmSignIn } from 'aws-amplify/auth';
import { useState } from 'react';
import { handleNextSignInStep } from '../utils/handleNextSignInStep';
import { useAuthenticator } from '../hooks/useAuthenticator';
import { AuthError } from './AuthError';

interface SelectMfaTypeProps {
	allowedMfaTypes: string[];
}

export function SelectMfaType({ allowedMfaTypes }: SelectMfaTypeProps) {
	const { dispatch } = useAuthenticator();

	const [mfaType, setMfaType] = useState<string>('SMS');
	const [error, setError] = useState<Error | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();

			const { nextStep } = await confirmSignIn({
				challengeResponse: mfaType,
			});
			handleNextSignInStep(nextStep, dispatch);
		} catch (err) {
			if (err instanceof Error) {
				setError(err);
			}
		}
	};
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMfaType(e.target.value);
	};

	return (
		<section>
			<h4>Select Mfa Type</h4>
			<form onSubmit={handleSubmit}>
				{allowedMfaTypes.map(type => (
					<label key={type}>
						<input
							type="radio"
							value={type}
							checked={mfaType === type}
							onChange={handleChange}
							data-test={`select-mfa-${type.toLowerCase()}`}
						/>
						{type}
					</label>
				))}
				<label>
					<input
						type="radio"
						value="PIGEON"
						checked={mfaType === 'PIGEON'}
						onChange={handleChange}
						data-test="select-mfa-invalid"
					/>
					PIGEON
				</label>
				<br />
				<button type="submit" data-test="select-mfa-button">
					Select Mfa Type
				</button>
				{error && <AuthError error={error} />}
			</form>
		</section>
	);
}
