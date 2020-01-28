import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { ConfirmSignInComponentCore } from './confirm-sign-in-component.core';
export declare class ConfirmSignInComponentIonic extends ConfirmSignInComponentCore {
    protected amplifyService: AmplifyService;
    _authState: AuthState;
    _show: boolean;
    code: string;
    errorMessage: string;
    constructor(amplifyService: AmplifyService);
}
