import { useEffect, useState } from "react";
import { useAuthenticator } from "../hooks/useAuthenticator";
import { confirmSignIn } from "aws-amplify/auth";
import { handleNextSignInStep } from "../utils/handleNextSignInStep";

import { AuthError } from "./AuthError";
import { Button, Text, TextInput, View } from "react-native";

interface ConfirmSignInProps {
  mfaCode: string;
}

export function ConfirmSignIn({ mfaCode }: ConfirmSignInProps) {
  const { dispatch } = useAuthenticator();

  const [code, setCode] = useState(mfaCode);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setCode(mfaCode);
  }, [mfaCode]);

  const handleSubmit = async () => {
    try {
      const { nextStep } = await confirmSignIn({
        challengeResponse: code,
      });
      handleNextSignInStep(nextStep, dispatch);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    }
  };

  return (
    <View>
      <Text>Confirm Sign In</Text>
      <TextInput
        placeholder="Code"
        value={code}
        onChangeText={(value) => setCode(value)}
      />
      <Button title="Submit Code" onPress={handleSubmit} />
      <View>{error && <AuthError error={error} />}</View>
    </View>
  );
}
