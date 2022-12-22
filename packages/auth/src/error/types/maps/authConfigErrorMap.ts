import { AuthConfigurationErrorCode } from '../code/authConfigErrorCode';

export type AuthConfigErrorMap = {
	[AuthConfigurationErrorCode.MissingAuthConfig]: {
		message: 'Amplify has not been configured correctly';
		recovery: `
	  The configuration object is missing required auth properties.
	  This error is typically caused by one of the following scenarios:
	
	  1. Did you run \`amplify push\` after adding auth via \`amplify add auth\`?
		  See https://aws-amplify.github.io/docs/js/authentication#amplify-project-setup for more information
	
	  2. This could also be caused by multiple conflicting versions of amplify packages, see (https://docs.amplify.aws/lib/troubleshooting/upgrading/q/platform/js) for help upgrading Amplify packages.
	`;
	};
	[AuthConfigurationErrorCode.NoConfig]: {
		message: 'No configuration found';
		recovery: `
	  This error is typically caused by one of the following scenarios:
	  
	  1. Make sure you're passing the awsconfig object to Amplify.configure() in your app's entry point
		  See https://aws-amplify.github.io/docs/js/authentication#configure-your-app for more information
	  
	  2. There might be multiple conflicting versions of amplify packages in your node_modules.
	  Refer to our docs site for help upgrading Amplify packages (https://docs.amplify.aws/lib/troubleshooting/upgrading/q/platform/js)
	  `;
	};
};
