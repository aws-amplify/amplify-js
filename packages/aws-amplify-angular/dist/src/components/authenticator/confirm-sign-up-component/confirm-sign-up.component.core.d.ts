import { OnInit } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
export declare class ConfirmSignUpComponentCore implements OnInit {
    protected amplifyService: AmplifyService;
    _authState: AuthState;
    _show: boolean;
    _usernameAttributes: string;
    username: string;
    code: string;
    errorMessage: string;
    protected logger: any;
    constructor(amplifyService: AmplifyService);
    data: any;
    hide: string[];
    authState: AuthState;
    usernameAttributes: string;
    ngOnInit(): void;
    shouldHide(comp: any): boolean;
    setUsername(username: string): void;
    setCode(code: string): void;
    onConfirm(): void;
    onResend(): void;
    onSignIn(): void;
    onAlertClose(): void;
    _setError(err: any): void;
    getUsernameLabel(): any;
}
