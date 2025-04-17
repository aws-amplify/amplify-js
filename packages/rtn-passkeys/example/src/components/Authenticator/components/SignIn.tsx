import { signIn, SignInInput } from "aws-amplify/auth";
import { useState } from "react";
import { handleNextSignInStep } from "../utils/handleNextSignInStep";
import { useAuthenticator } from "../hooks/useAuthenticator";
import { AuthError } from "./AuthError";
import { Button, Text, TextInput, View } from "react-native";

export function SignIn() {
  const [state, setState] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState<Error | null>(null);

  const { dispatch } = useAuthenticator();

  const handleChange = (name: string) => (value: string) => {
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const options: SignInInput["options"] = {
        authFlowType: "USER_AUTH",
      };

      const { nextStep } = await signIn({
        username: state.username,
        password: state.password,
        options,
      });

      handleNextSignInStep(nextStep, dispatch, state.username);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    }
  };

  return (
    <View>
      <Text>Sign In</Text>
      <TextInput
        placeholder="Username"
        value={state.username}
        onChangeText={handleChange("username")}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={state.password}
        onChangeText={handleChange("password")}
      />
      <Button title="Sign in" onPress={handleSubmit} />
      <Button title="Sign Up" onPress={() => dispatch({ type: "sign-up" })} />
      <View>{error && <AuthError error={error} />}</View>
    </View>
  );
}
