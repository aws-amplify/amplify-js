/**
 * Auth & Storage shouldn't be bundled because they're unused
 */
import { Amplify, Auth, Storage } from "aws-amplify";

Amplify.configure();
