import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';

import Auth, { AuthClass } from '@aws-amplify/auth';

import { AuthState } from './auth.state';
import { authDecorator } from './auth.decorator';


@Injectable()
export class AmplifyService {
  private _auth: AuthClass;
  // private _analytics: AnalyticsClass;
  // private _storage: StorageClass;
  // private _api: APIClass;
  // private _cache: any;
  // private _pubsub: any;
  // private _interactions: InteractionsClass;

  private _authState = new Subject<AuthState>();
  authStateChange$ = this._authState.asObservable();

  constructor() {
    authDecorator(this._authState);

    this._auth = Auth;
    // this._analytics = Amplify.Analytics;
    // this._storage = Amplify.Storage;
    // this._api = Amplify.API;
    // this._cache = Amplify.Cache;
    // this._pubsub = Amplify.PubSub;
    // this._interactions = Amplify.Interactions;

  }

  auth(): AuthClass { return this._auth; }
  analytics(): any { return null; }
  storage():  any { return null; }
  api():  any { return null; }
  interactions(): any { return null; }
  cache():  any { return null; }
  pubsub():  any { return null; }

  authState() { return this._authState; }
  setAuthState(state: AuthState) { this._authState.next(state); }
}
