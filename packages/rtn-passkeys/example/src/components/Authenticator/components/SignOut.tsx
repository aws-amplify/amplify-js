import { signOut } from "aws-amplify/auth";
import { useAuthenticator } from "../hooks/useAuthenticator";
import { Fragment, useState } from "react";
import { AuthError } from "./AuthError";
import { Button } from "react-native";

export function SignOut() {
  const { dispatch } = useAuthenticator();
  const [error, setError] = useState<Error | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      dispatch({ type: "sign-in" });
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    }
  };

  return (
    <Fragment>
      <Button title="Sign Out" onPress={handleSignOut} />
      {error && <AuthError error={error} />}
    </Fragment>
  );
}
