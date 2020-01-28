import { AmplifyService } from '../../../providers/amplify.service';
import { ForgotPasswordComponentCore } from './forgot-password.component.core';
export declare class ForgotPasswordComponentIonic extends ForgotPasswordComponentCore {
    protected amplifyService: AmplifyService;
    constructor(amplifyService: AmplifyService);
    onCodeChange(val: any): void;
    onNumberChange(val: any): void;
    setUsername(username: string): void;
    setEmail(email: string): void;
}
