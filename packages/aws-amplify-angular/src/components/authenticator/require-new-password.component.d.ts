import { AmplifyService, AuthState } from '../../providers';
export declare class RequireNewPasswordComponent {
    _authState: AuthState;
    _show: boolean;
    password: string;
    errorMessage: string;
    amplifyService: AmplifyService;
    constructor(amplifyService: AmplifyService);
    authState: AuthState;
    setPassword(password: string): void;
    onSubmit(): void;
    onSignIn(): void;
    _setError(err: any): void;
}
