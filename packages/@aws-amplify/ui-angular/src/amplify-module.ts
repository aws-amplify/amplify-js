import { NgModule } from '@angular/core';
import { defineCustomElements } from '@aws-amplify/ui-components/loader';

import { AmplifyAuthenticator } from './directives/proxies';

defineCustomElements(window);

const DECLARATIONS = [AmplifyAuthenticator];

@NgModule({
	declarations: DECLARATIONS,
	exports: DECLARATIONS,
	imports: [],
	providers: [],
})
export class AmplifyModule {}
