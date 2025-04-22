'use client';

import { Fragment, useCallback, useEffect } from 'react';
import { AuthenticatorContext } from '../context/AuthenticatorContext';
import { authenticatorReducer } from '../reducers/authenticatorReducer';
import { SignIn } from '../components/SignIn';
import { ConfirmSignIn } from '../components/ConfirmSignIn';
import { SignOut } from '../components/SignOut';
import { Loading } from '../components/Loading';
import { SetupTotp } from '../components/SetupTotp';
import { SelectMfaType } from '../components/SelectMfaType';
import { SignUp } from '../components/SignUp';
import { ConfirmSignUp } from '../components/ConfirmSignUp';
import { SetupEmailOtp } from '../components/SetupEmailOtp';

import { usePersistedReducer } from '../hooks/usePersistedReducer';
import { useMfaCode } from '../hooks/useMfaCode';
// import { SkeletonCard } from '../../Skeleton';
import { SelectFirstFactor } from '../components/SelectFirstFactor';
import { AutoSignIn } from '../components/AutoSignIn';
import { NewPassword } from '../components/NewPassword';
import { Button, Text } from 'react-native';

type AuthenticatorProviderProps = { children: React.ReactNode };

export function AuthenticatorProvider({
	children,
}: AuthenticatorProviderProps) {
	const [state, dispatch] = usePersistedReducer(authenticatorReducer, {
		state: 'loading',
	});

	const [mfaCode, setMfaCode] = useMfaCode();

	useEffect(() => {
		if (state.state === 'authenticated' || state.state === 'sign-in') {
			setMfaCode('');
		}
	}, [state.state, setMfaCode]);

	const getAuthenticatorChildren = useCallback(() => {
		if (state.state === 'authenticated') {
			return (
				<Fragment>
					<SignOut />
					{children}
				</Fragment>
			);
		}

		if (state.state === 'sign-in') {
			return <SignIn />;
		}

		if (state.state === 'sign-up') {
			return <SignUp />;
		}

		if (state.state === 'confirm-sign-in') {
			// if (!mfaCode) return <SkeletonCard />;
			return <ConfirmSignIn mfaCode={mfaCode} />;
		}

		if (state.state === 'confirm-sign-up') {
			// if (!mfaCode) return <SkeletonCard />;
			return (
				<ConfirmSignUp username={state.props?.username} mfaCode={mfaCode} />
			);
		}
		if (state.state === 'setup-totp') {
			return <SetupTotp setupUri={state.props?.setupUri} />;
		}

		if (state.state === 'setup-email-otp') {
			return <SetupEmailOtp />;
		}

		if (state.state === 'select-mfa-type') {
			return <SelectMfaType allowedMfaTypes={state.props?.allowedMfaTypes} />;
		}

		if (state.state === 'select-first-factor') {
			return (
				<SelectFirstFactor
					availableChallenges={state.props?.availableChallenges}
				/>
			);
		}

		if (state.state === 'auto-sign-in') {
			return <AutoSignIn />;
		}

		if (state.state === 'new-password') {
			return <NewPassword />;
		}

		if (state.state === 'loading') {
			return <Loading />;
		}

		return null;
	}, [state, children, mfaCode]);

	const handleReset = () => dispatch({ type: 'loading' });

	return (
		<AuthenticatorContext.Provider value={{ state, dispatch }}>
			<Button onPress={handleReset} title="Reset"></Button>
			<Text>
				{state.state === 'authenticated' ? 'Signed In' : 'Signed Out'}
			</Text>
			<Text>{state.props?.signInStep}</Text>
			{getAuthenticatorChildren()}
			{/* <AutoSignIn /> */}
		</AuthenticatorContext.Provider>
	);
}
