import { signUp, SignUpInput } from "aws-amplify/auth";
import { useState } from "react";
import { useAuthenticator } from "../hooks/useAuthenticator";
import { handleNextSignUpStep } from "../utils/handleNextSignUpStep";
import { AuthError } from "./AuthError";
import { assertAuthFlowType } from "../types";
import { Button, Text, TextInput, View } from "react-native";

export function SignUp() {
  const [state, setState] = useState({
    username: "",
    password: "",
    email: "",
    phone_number: "",
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
      const userAttributes: Record<string, string> = {
        nickname: state.username,
      };

      if (state.email) {
        userAttributes.email = state.email;
      }
      if (state.phone_number) {
        userAttributes.phone_number = state.phone_number;
      }

      const options: NonNullable<SignUpInput["options"]> = {
        userAttributes,
        autoSignIn: {
          authFlowType: "USER_AUTH",
        },
      };

      const { nextStep } = await signUp({
        username: state.username,
        password: state.password,
        options,
      });

      handleNextSignUpStep(nextStep, dispatch, state.username);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    }
  };

  return (
    <View>
      <Text>Sign Up</Text>
      <TextInput
        placeholder="Username"
        value={state.username}
        onChangeText={handleChange("username")}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Email"
        value={state.email}
        onChangeText={handleChange("email")}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Phone number"
        value={state.phone_number}
        onChangeText={handleChange("phone_number")}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={state.password}
        onChangeText={handleChange("password")}
        autoCapitalize="none"
      />
      <Button title="Sign Up" onPress={handleSubmit} />
      {error && <AuthError error={error} />}
    </View>
  );
}
