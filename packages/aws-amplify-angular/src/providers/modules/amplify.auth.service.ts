import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import  Auth, { AuthClass } from '@aws-amplify/auth';
import { AuthState } from '../auth.state';
import { authDecorator } from '../auth.decorator';
import { Constructor } from './amplify.compose.constructor';


export function AmplifyAuthService<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
     _auth: AuthClass;

     _authState = new Subject<AuthState>();
      authStateChange$ = this._authState.asObservable();
    
    constructor(...args: any[]) {
      super(...args);
      authDecorator(this._authState);
      this._auth = Auth;
    }
    
    auth(): AuthClass { return this._auth; }
    authState() { return this._authState; }
    setAuthState(state: AuthState) { this._authState.next(state); }
  };
}
