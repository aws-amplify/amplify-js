import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { AmazonSignInComponentCore } from '../../../components/authenticator/federated-sign-in-component/amazon-sign-in-component/amazon-sign-in.component.core'
import Amplify from 'aws-amplify';

describe('AmazonSignInComponentCore (basics): ', () => {

  let component: AmazonSignInComponentCore;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new AmazonSignInComponentCore(service);
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