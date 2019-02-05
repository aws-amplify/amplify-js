import { Optional, FactoryProvider , SkipSelf } from '@angular/core';

import { AmplifyService } from './amplify.service';

/**
 * Ensure a single global service provider
 * @deprecated
 * @deletion-target once the module depends on angular v6
 */
export function AMPLIFY_SERVIDE_PROVIDER_FACTORY(parentService: AmplifyService) {
    return parentService || new AmplifyService();
}


/**
* Export provider that uses a global service factory (above)
* @deprecated
* @deletion-target once the module depends on angular v6
*/
export const AMPLIFY_SERVICE_PROVIDER: FactoryProvider = {
    provide: AmplifyService,
    deps: [[new Optional(), new SkipSelf(), AmplifyService]],
    useFactory: AMPLIFY_SERVIDE_PROVIDER_FACTORY
};
