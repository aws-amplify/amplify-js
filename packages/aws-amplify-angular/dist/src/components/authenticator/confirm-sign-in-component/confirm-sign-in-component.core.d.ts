import { OnInit } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
export declare class ConfirmSignInComponentCore implements OnInit {
    protected amplifyService: AmplifyService;
    _authState: AuthState;
    _show: boolean;
    code: string;
    errorMessage: string;
    protected logger: any;
    constructor(amplifyService: AmplifyService);
    data: any;
    authState: AuthState;
    hide: string[];
    ngOnInit(): void;
    shouldHide(comp: any): boolean;
    setCode(code: string): void;
    onConfirm(): void;
    onSignIn(): void;
    onAlertClose(): void;
    _setError(err: any): void;
}
