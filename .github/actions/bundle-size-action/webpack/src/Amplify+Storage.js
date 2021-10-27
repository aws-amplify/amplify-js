import { Amplify, Storage } from "aws-amplify";

Amplify.configure();
Storage.get("foo");
