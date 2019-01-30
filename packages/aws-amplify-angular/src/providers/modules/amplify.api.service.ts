import { Injectable } from '@angular/core';
import  API, { APIClass  } from '@aws-amplify/api';
import { Constructor } from './amplify.compose.constructor';

export function AmplifyAPIService<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
     _api: APIClass;
    
    constructor(...args: any[]) {
      super(...args);
      this._api = API;
    }
    api(): APIClass { return this._api; }
  };
}
