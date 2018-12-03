import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import Amplify, {
  AuthClass,
  AnalyticsClass,
  StorageClass,
  InteractionsClass 
} from 'aws-amplify';


import { AuthState } from './auth.state';
import { authDecorator } from './auth.decorator';
import { AnySoaRecord } from 'dns';


@Injectable()
export class AmplifyService {
  private _auth: AuthClass;
  private _analytics: AnalyticsClass;
  private _storage: StorageClass;
  private _api: any;
  private _cache: any;
  private _pubsub: any;
  private _interactions: InteractionsClass;

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

  }

  auth(): AuthClass { return this._auth; }
  analytics(): any { return null; }
  storage():  any { return null; }
  api():  any { return this._api; }
  interactions(): any { return null; }
  cache():  any { return null; }
  pubsub():  any { return null; }

  authState() { return this._authState; }
  setAuthState(state: AuthState) { this._authState.next(state); }
}
