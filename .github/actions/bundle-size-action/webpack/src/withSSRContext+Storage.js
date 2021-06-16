import { Amplify, withSSRContext, Storage } from "aws-amplify";

Amplify.configure();

const SSR = withSSRContext({ modules: [Storage], req });
