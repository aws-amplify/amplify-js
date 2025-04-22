import React, { useState } from "react";
import { useAuthenticator } from "../hooks/useAuthenticator";
import { AuthError } from "./AuthError";
import { autoSignIn } from "aws-amplify/auth";
import { handleNextSignInStep } from "../utils/handleNextSignInStep";
import { Button, Text, View } from "react-native";

export function AutoSignIn() {
  const { dispatch } = useAuthenticator();

  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async () => {
    try {
      const { nextStep } = await autoSignIn();

      handleNextSignInStep(nextStep, dispatch);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    }
  };

  return (
    <View>
      <Text>Auto Sign In</Text>
      <Button title="Auto Sign In" onPress={handleSubmit} />
      {error && <AuthError error={error} />}
    </View>
  );
}
