import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { GreetingComponentIonic } from '../../../components/authenticator/greeting-component/greeting.component.ionic';


describe('GreetingsComponentCore: ', () => {

  let component: GreetingComponentIonic;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new GreetingComponentIonic(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have an onSignOut method', () => {
    expect(component.onSignOut).toBeTruthy();
  });

  it('...should have a setAuthState method', () => {
    expect(component.setAuthState).toBeTruthy();
  });

  it('...should have a subscribe method', () => {
    expect(component.subscribe).toBeTruthy();
  });

});