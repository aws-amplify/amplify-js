import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { AmazonSignInComponentIonic } from '../../../components/authenticator/federated-sign-in-component/amazon-sign-in-component/amazon-sign-in.component.ionic'
import Amplify from 'aws-amplify';

describe('AmazonSignInComponentIonic (basics): ', () => {

  let component: AmazonSignInComponentIonic;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new AmazonSignInComponentIonic(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });

  it('...should be created', () => {
    expect(component).toBeTruthy();
  });
  it('...should have a onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });
  it('...should have a initAmazon method', () => {
    expect(component.initAmazon).toBeTruthy();
  });
  it('...should have a amazonAuthorize method', () => {
    expect(component.amazonAuthorize).toBeTruthy();
  });
  it('...should have a amazonRetrieveProfile method', () => {
    expect(component.amazonRetrieveProfile).toBeTruthy();
  });
  it('...should have a createScript method', () => {
    expect(component.createScript).toBeTruthy();
  });
});