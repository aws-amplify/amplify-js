import { useEffect, useState } from "react";
import { useAuthenticator } from "../hooks/useAuthenticator";
import { confirmSignUp } from "aws-amplify/auth";
import { handleNextSignUpStep } from "../utils/handleNextSignUpStep";
import { AuthError } from "./AuthError";
import { Button, Text, TextInput, View } from "react-native";

type ConfirmSignUpProps = {
  username: string;
  mfaCode: string;
};

export function ConfirmSignUp({ username, mfaCode }: ConfirmSignUpProps) {
  const { dispatch } = useAuthenticator();

  const [code, setCode] = useState(mfaCode);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setCode(mfaCode);
  }, [mfaCode]);

  const handleSubmit = async () => {
    try {
      const { nextStep } = await confirmSignUp({
        username,
        confirmationCode: code,
      });

      handleNextSignUpStep(nextStep, dispatch);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    }
  };

  return (
    <View>
      <Text>Confirm Sign Up</Text>
      <TextInput
        placeholder="Code"
        value={code}
        onChangeText={(value) => setCode(value)}
      />
      <Button title="Submit Code" onPress={handleSubmit} />

      {error && <AuthError error={error} />}
    </View>
  );
}
