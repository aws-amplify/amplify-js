import { NgModule } from '@angular/core';
import { defineCustomElements } from '@aws-amplify/ui-components/loader';

import {
	AmplifyAuthenticator,
	AmplifySignIn,
	AmplifySignUp,
	AmplifySignOut,
	AmplifyConfirmSignIn,
	AmplifyConfirmSignUp,
	AmplifyForgotPassword,
	AmplifyRequireNewPassword,
	AmplifyVerifyContact,
	AmplifyTotpSetup,
} from './directives/proxies';

defineCustomElements(window);

const DECLARATIONS = [
	AmplifyAuthenticator,
	AmplifySignIn,
	AmplifySignUp,
	AmplifySignOut,
	AmplifyConfirmSignIn,
	AmplifyConfirmSignUp,
	AmplifyForgotPassword,
	AmplifyRequireNewPassword,
	AmplifyVerifyContact,
	AmplifyTotpSetup,
];

@NgModule({
	declarations: DECLARATIONS,
	exports: DECLARATIONS,
	imports: [],
	providers: [],
})
export class AmplifyUIAngularModule { }
