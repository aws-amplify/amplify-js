// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../errors/AuthError';
import { AUTO_SIGN_IN_EXCEPTION } from '../../../errors/constants';
import { AutoSignInCallback } from '../../../types/models';
import { SignInOutput } from '../types';

const initialAutoSignIn: AutoSignInCallback =
	async (): Promise<SignInOutput> => {
		throw new AuthError({
			name: AUTO_SIGN_IN_EXCEPTION,
			message:
				'The autoSignIn flow has not started, been cancelled or been completed.',
			recoverySuggestion:
				'Please try to use the signIn API or log out before starting a new autoSignIn flow.',
		});
	};

/**
 * Auto signs a user in
 *
 * This API will auto sign a user in if the autoSignIn flow has been completed on the following cases:
 * - User was able to confirm their account with a verification code sent to their phone or email.
 * This is the default option for autoSignIn.
 * - User was able to confirm their account with a verification link sent to their phone or email. In order to
 * enable this option you need to go to Amazon Cognito [console](https://aws.amazon.com/pm/cognito/?trk=f5fef02c-2926-48d3-898a-b4d668742a20&sc_channel=ps&ef_id=CjwKCAjwyY6pBhA9EiwAMzmfwVpQnKgvNQ-yA7kHwmmnxVFP60Y5HmqvwXB7TvQTdC0vtObvOu7DDRoCOV0QAvD_BwE:G:s&s_kwcid=AL!4422!3!651737511575!e!!g!!amazon%20cognito!19845796024!146736269189), 
 * look for your userpool, then go to the `Messaging` tab and enable `link` mode inside the `Verification message` option.
 * Finally you need to define the `signUpVerificationMethod` in your `Auth` config.
 * 
 * @example
 * ```typescript
 *  Amplify.configure({
 *    Auth: {
       Cognito: {
	    ...cognitoConfig,
	    signUpVerificationMethod: "link" // the default value is "code"
	   }
	}});
 * ```
 *
 * @throws AutoSignInException - Thrown when the autoSignIn flow has not been started, been cancelled or been completed.
 * @returns The signInOutput.
 *
 * @example
 * ```typescript
 *  // handleSignUp.ts
 async function handleSignUp(
   username:string, 
   password:string
 ){
    try {
      const { nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes:{ email:'email@email.com'},
          serviceOptions: { 
            autoSignIn: true // This enables the auto sign-in flow.
          },
        },
      });
 
      handleSignUpStep(nextStep);
      
    } catch (error) {
      console.log(error);
    }
  }
 
 // handleConfirmSignUp.ts 
 async function handleConfirmSignUp(username:string, confirmationCode:string) {
    try {
      const { nextStep } = await confirmSignUp({
        username,
        confirmationCode,
      });
      
      handleSignUpStep(nextStep);
    } catch (error) {
      console.log(error);
    }
  }

// signUpUtils.ts
async function handleSignUpStep( step: SignUpOutput["nextStep"]) {
  switch (step.signUpStep) {
    case "CONFIRM_SIGN_UP":
      
     // Redirect end-user to confirm-sign up screen.

    case "COMPLETE_AUTO_SIGN_IN":
	     const codeDeliveryDetails = step.codeDeliveryDetails;
      if (codeDeliveryDetails) { 
       // Redirect user to confirm-sign-up with link screen.
      }
      const signInOutput = await autoSignIn();
    // handle sign-in steps
  }
 * 
 * ```
 */
export let autoSignIn: AutoSignInCallback = initialAutoSignIn;

/**
 * Sets the context of autoSignIn at run time.
 * @internal
 */
export function setAutoSignIn(callback: AutoSignInCallback) {
	autoSignIn = callback;
}

/**
 * Resets the context
 *
 * @internal
 */
export function resetAutoSignIn() {
	autoSignIn = initialAutoSignIn;
}
