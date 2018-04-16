import { TestBed, ComponentFixture, inject } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Subject } from 'rxjs/Subject';
import { ConfirmSignInComponent } from '../../../components/authenticator/confirm-sign-in.component'
import { AmplifyService } from '../../../providers/amplify.service';
import Amplify, {
  Logger,
  AuthClass,
  AnalyticsClass,
  StorageClass,
  APIClass
} from 'aws-amplify';
import { AuthState } from '../../../providers/auth.state';

describe('ConfirmSignInComponent:', () => {

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  })

  let component: ConfirmSignInComponent;
  let fixture: ComponentFixture<ConfirmSignInComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AmplifyService],
      declarations: [ConfirmSignInComponent]
    });

  
  });

  it('...should be created', () => {
    expect(component).toBeTruthy();
  });



  afterAll(() => {
    TestBed.resetTestEnvironment();
  });

});
