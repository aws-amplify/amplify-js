import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { FederatedSignInComponentCore } from '../../../components/authenticator/federated-sign-in-component/federated-sign-in.component.core'
import Amplify from 'aws-amplify';

describe('FederatedSignInComponentCore (basics): ', () => {

  let component: FederatedSignInComponentCore;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new FederatedSignInComponentCore(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });
});