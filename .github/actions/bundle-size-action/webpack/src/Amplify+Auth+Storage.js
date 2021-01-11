import { Amplify, Auth, Storage } from "aws-amplify";

Amplify.configure();
Auth.signIn();
Storage.get("foo");
