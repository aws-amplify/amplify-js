import { Amplify, Auth, withSSRContext } from 'aws-amplify';

// For real-world usage – `import awsExports from "../src/aws-exports";`
const awsExports = {};

Amplify.configure({ ...awsExports, ssr: true });

export default async (req, res) => {
	const SSR = withSSRContext({ modules: [Auth], req });
	const user = await SSR.Auth.currentAuthenticatedUser();

	return JSON.parse(JSON.stringify(user));
};
