import { OnInit } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
export declare class AuthenticatorComponentCore implements OnInit {
    protected amplifyService: AmplifyService;
    authState: AuthState;
    _signUpConfig: any;
    _usernameAttributes: string;
    constructor(amplifyService: AmplifyService);
    ngOnInit(): void;
    hide: string[];
    data: any;
    signUpConfig: any;
    usernameAttributes: string;
    subscribe(): void;
    shouldHide(comp: any): boolean;
}
