// the original ts3.7 version declaration file, used by "typesVersions" field in package.json
// can consider introducing tool like downlevel-dts in the build process in the future
import { API } from '../../lib-esm/API';
export { API, APIClass } from '../../lib-esm/API';
export {
	graphqlOperation,
	GraphQLAuthError,
	GRAPHQL_AUTH_MODE,
	GraphQLResult,
} from '@aws-amplify/api-graphql';
export default API;
