import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import Amplify, {
  Logger,
  AuthClass,
  AnalyticsClass,
  StorageClass,
  APIClass,
  InteractionsClass,
  XRClass
} from 'aws-amplify';

import { AuthState } from './auth.state';
import { authDecorator } from './auth.decorator';

const logger = new Logger('AmplifyService');

@Injectable()
export class AmplifyService {
  private _auth: AuthClass;
  private _analytics: AnalyticsClass;
  private _storage: StorageClass;
  private _api: APIClass;
  private _cache: any;
  private _pubsub: any;
  private _interactions: InteractionsClass;
  private _logger: any; 
  private _xr: XRClass;
  private _authState = new Subject<AuthState>();
  authStateChange$ = this._authState.asObservable();

  constructor() {
    authDecorator(this._authState);

    this._auth = Amplify.Auth;
    this._analytics = Amplify.Analytics;
    this._storage = Amplify.Storage;
    this._api = Amplify.API;
    this._cache = Amplify.Cache;
    this._pubsub = Amplify.PubSub;
    this._interactions = Amplify.Interactions;
    this._logger =  Amplify.Logger;
    this._xr = Amplify.XR;
  }

  auth(): AuthClass { return this._auth; }
  analytics(): AnalyticsClass { return this._analytics; }
  storage(): StorageClass { return this._storage; }
  api(): APIClass { return this._api; }
  interactions(): InteractionsClass { return this._interactions; }
  cache(): any { return this._cache; }
  pubsub(): any { return this._pubsub; }
  logger(name, level): Logger { return new this._logger(name, level); }
  xr(): any { return this._xr; }

  authState() { return this._authState; }
  setAuthState(state: AuthState) { this._authState.next(state); }
}
