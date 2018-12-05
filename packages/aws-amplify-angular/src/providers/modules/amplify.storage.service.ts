import { Injectable } from '@angular/core';
import  Storage, { StorageClass } from '@aws-amplify/storage';
import { Constructor } from './amplify.compose.constructor';

export function AmplifyStorageService<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
     _storage: StorageClass;
    
    constructor(...args: any[]) {
      super(...args);
      this._storage = Storage;
    }
    storage(): StorageClass { return this._storage; }
  };
}
