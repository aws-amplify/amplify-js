// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
// tslint:enable

import { Injectable, Optional, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import Amplify, { Logger } from '@aws-amplify/core';
import { AuthState } from './auth.state';
import { authDecorator } from './auth.decorator';

import { AnalyticsClass } from '@aws-amplify/analytics';
import { APIClass } from '@aws-amplify/api';
import { AuthClass } from '@aws-amplify/auth';
import { InteractionsClass} from '@aws-amplify/interactions';
import { StorageClass } from '@aws-amplify/storage';
 
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
  private _xr: any;
  private _authState = new Subject<AuthState>();
  authStateChange$ = this._authState.asObservable();


  constructor (
    @Inject('modules') 
    @Optional()
    private modules: any = {}) {

    const source = modules || Amplify;

    if (source.Auth) {
      authDecorator(this._authState, source.Auth);
    }

    this._auth = source.Auth;
    this._analytics = source.Analytics;
    this._storage = source.Storage;
    this._api = source.API;
    this._cache = source.Cache;
    this._pubsub = source.PubSub;
    this._interactions = source.Interactions;
    this._logger = Logger;
    this._xr = source.XR;
  }

  auth(): AuthClass { return this._auth; }
  analytics(): AnalyticsClass { return this._analytics; }
  storage(): StorageClass { return this._storage; }
  api(): APIClass { return this._api; }
  interactions(): InteractionsClass { return this._interactions; }
  cache(): any { return this._cache; }
  pubsub(): any { return this._pubsub; }
  logger(name, level?): Logger { return new this._logger(name, level); }
  xr(): any { return this._xr; }

  authState() { return this._authState; }
  setAuthState(state: AuthState) { this._authState.next(state); }
}
