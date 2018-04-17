import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { GreetingsComponent } from '../../../components/authenticator/greetings.component'


describe('GreetingsComponent: ', () => {

  let component: GreetingsComponent;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new GreetingsComponent(service);
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