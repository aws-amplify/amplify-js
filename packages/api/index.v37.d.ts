// the original ts3.7 version declaration file, used by "typesVersions" field in package.json
// https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#file-redirects
// can consider using third-party tool like downlevel-dts in the build process to automate this.
import { API } from './lib-esm/API';
export { API, APIClass } from './lib-esm/API';
export {
	graphqlOperation,
	GraphQLAuthError,
	GRAPHQL_AUTH_MODE,
	GraphQLResult,
} from '@aws-amplify/api-graphql';
export default API;
