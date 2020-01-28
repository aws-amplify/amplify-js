import { OnInit } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
export declare class GreetingComponentCore implements OnInit {
    protected amplifyService: AmplifyService;
    signedIn: boolean;
    greeting: string;
    _usernameAttributes: string;
    protected logger: any;
    constructor(amplifyService: AmplifyService);
    authState: AuthState;
    usernameAttributes: string;
    ngOnInit(): void;
    subscribe(): void;
    setAuthState(authState: AuthState): void;
    onSignOut(): void;
}
