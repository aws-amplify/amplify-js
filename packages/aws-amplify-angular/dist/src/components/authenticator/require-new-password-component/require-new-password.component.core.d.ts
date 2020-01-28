import { OnInit } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
export declare class RequireNewPasswordComponentCore implements OnInit {
    protected amplifyService: AmplifyService;
    _authState: AuthState;
    _show: boolean;
    password: string;
    errorMessage: string;
    protected logger: any;
    constructor(amplifyService: AmplifyService);
    authState: AuthState;
    hide: string[];
    data: any;
    ngOnInit(): void;
    shouldHide(comp: any): boolean;
    setPassword(password: string): void;
    onSubmit(): void;
    onSignIn(): void;
    onAlertClose(): void;
    _setError(err: any): void;
}
