import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { FederatedSignInComponentIonic } from '../../../components/authenticator/federated-sign-in-component/federated-sign-in.component.ionic'
import Amplify from 'aws-amplify';

describe('FederatedSignInComponentIonic (basics): ', () => {

  let component: FederatedSignInComponentIonic;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new FederatedSignInComponentIonic(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });
});