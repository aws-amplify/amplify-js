import { AmplifyService } from '../../../providers/amplify.service';
import { GreetingComponentCore } from './greeting.component.core';
export declare class GreetingComponentIonic extends GreetingComponentCore {
    protected amplifyService: AmplifyService;
    constructor(amplifyService: AmplifyService);
}
