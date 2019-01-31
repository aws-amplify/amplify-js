import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import Amplify, { Logger } from '@aws-amplify/core';
import { AuthState } from './auth.state';
import { authDecorator } from './auth.decorator';

const logger = new Logger('AmplifyService');

@Injectable()
export class AmplifyService {
  private _auth: any;
  private _analytics: any;
  private _storage: any;
  private _api: any;
  private _cache: any;
  private _pubsub: any;
  private _interactions: any;
  private _logger: any; 
  private _xr: any;
  private _authState = new Subject<AuthState>();
  authStateChange$ = this._authState.asObservable();

  constructor () {
    authDecorator(this._authState);
    this._auth = Amplify.Auth || {}; 
    this._analytics = Amplify.Analytics || {};
    this._storage = Amplify.Storage || {};
    this._api = Amplify.API || {} ;
    this._cache = Amplify.Cache || {};
    this._pubsub = Amplify.PubSub || {};
    this._interactions = Amplify.Interactions || {};
    this._logger = Amplify.Logger;
    this._xr = Amplify.XR || {};
  }


  auth() { return this._auth; }
  analytics(): any { return this._analytics; }
  storage(): any { return this._storage; }
  api(): any { return this._api; }
  interactions(): any { return this._interactions; }
  cache(): any { return this._cache; }
  pubsub(): any { return this._pubsub; }
  logger(name, level): Logger { return new this._logger(name, level); }
  xr(): any { return this._xr; }

  authState() { return this._authState; }
  setAuthState(state: AuthState) { this._authState.next(state); 
  }
}
