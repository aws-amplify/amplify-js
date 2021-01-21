import { Amplify, withSSRContext } from "aws-amplify";

Amplify.configure();

const SSR = withSSRContext({ req });
