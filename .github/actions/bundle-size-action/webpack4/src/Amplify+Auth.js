import { Amplify, Auth } from "aws-amplify";

Amplify.configure();
Auth.signIn();
