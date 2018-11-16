import { TestBed, inject } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import {Subject} from 'rxjs';
import { AuthState }  from '../../providers/auth.state';

describe('AuthState', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('...should be created',  () => {
    const AuthStateInterface =  new Subject<AuthState>();
    expect(AuthStateInterface).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestEnvironment();
  });
});
