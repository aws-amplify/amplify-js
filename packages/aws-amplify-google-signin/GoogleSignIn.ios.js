import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  View,
  NativeEventEmitter,
  NativeModules,
  requireNativeComponent,
  ViewPropTypes,
} from 'react-native';
import {Logger} from 'aws-amplify';

const { RNAmplifyGoogleSignIn } = NativeModules;
const logger = new Logger('GoogleSignin');
logger.debug('Native module is : ', RNAmplifyGoogleSignIn);
const aNativeAppEventEmitter = new NativeEventEmitter(RNAmplifyGoogleSignIn);
class GoogleSignin {

    constructor() {
      this._user = null;
      this.signinIsInProcess = false;
    }
  
    hasPlayServices(params = { autoResolve: true }) {
      return Promise.resolve(true);
    }
  
    configure(params={}) {
      if (!params.iosClientId) {
        throw new Error('GoogleSignin - Missing iOS app ClientID');
      }
  
      if (params.offlineAccess && !params.webClientId) {
        throw new Error('GoogleSignin - offline use requires server web ClientID');
      }
  
      params = [
      params.scopes || [], params.iosClientId, params.offlineAccess ? params.webClientId : '', params.hostedDomain ? params.hostedDomain : null
      ];
  
      RNAmplifyGoogleSignIn.configure(...params);
      return Promise.resolve(true);
    }
  
    currentUserAsync() {
      return new Promise((resolve, reject) => {
        const sucessCb = aNativeAppEventEmitter.addListener('RNGoogleSignInSuccess', (user) => {
            this._user = user;
            this._removeListeners(sucessCb, errorCb);
            resolve(user);
          });
    
          const errorCb = aNativeAppEventEmitter.addListener('RNGoogleSignInError', () => {
            this._removeListeners(sucessCb, errorCb);
            resolve(null);
          });
    
          RNAmplifyGoogleSignIn.currentUserAsync();
        });
    }
    
    currentUser() {
        return {...this._user};
    }

    signIn() {
      return new Promise((resolve, reject) => {
          const sucessCb = aNativeAppEventEmitter.addListener('RNGoogleSignInSuccess', (user) => {
            this._user = user;
            this.signinIsInProcess = false;
            this._removeListeners(sucessCb, errorCb);
            resolve(user);
          });
    
          const errorCb = aNativeAppEventEmitter.addListener('RNGoogleSignInError', (err) => {
            this._removeListeners(sucessCb, errorCb);
            this.signinIsInProcess = false;
            reject(err);
          });
    
          !this.signinIsInProcess && RNAmplifyGoogleSignIn.signIn();
        });
      }
    
      signOut() {
        return new Promise((resolve, reject) => {
          RNAmplifyGoogleSignIn.signOut();
          resolve();
        });
      }

      revokeAccess() {
        return new Promise((resolve, reject) => {
          const sucessCb = aNativeAppEventEmitter.addListener('RNGoogleRevokeSuccess', () => {
            this._removeListeners(sucessCb, errorCb);
            resolve();
          });
    
          const errorCb = aNativeAppEventEmitter.addListener('RNGoogleRevokeError', (err) => {
            this._removeListeners(sucessCb, errorCb);
            reject(err);
          });
    
          RNAmplifyGoogleSignIn.revokeAccess();
        });
      }
    
      _removeListeners(...listeners) {
        listeners.forEach(lt => lt.remove());
      }
    }
    
    const GoogleSignInSingleton = new GoogleSignin();
     export default GoogleSignInSingleton;
