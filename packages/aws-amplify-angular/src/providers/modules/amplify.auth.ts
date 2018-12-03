import { AuthState } from '../auth.state';
import { authDecorator } from '../auth.decorator';
import { Subject, Observable } from 'rxjs';

import { AuthClass } from 'aws-amplify';
import Auth from '@aws-amplify/auth';

export class AmplifyAuth {
  private _authState = new Subject<AuthState>();
  private _auth: AuthClass;
  authStateChange$ = this._authState.asObservable();

  constructor() {
    authDecorator(this._authState);
    this._auth = Auth;
  }

  auth = function(): AuthClass { return this._auth; };
  authState = function() { return this._authState; };
  setAuthState = function(state: AuthState) { this._authState.next(state); };

}
