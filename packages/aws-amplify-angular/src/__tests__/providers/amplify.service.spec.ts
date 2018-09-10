import { TestBed, inject } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Subject } from 'rxjs/Subject';
import { AmplifyService } from '../../providers/amplify.service';
import Amplify, {
  Logger,
  AuthClass,
  AnalyticsClass,
  StorageClass,
  APIClass
} from 'aws-amplify';
import { AuthState } from '../../providers/auth.state';

describe('AmplifyService:', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AmplifyService]
    });
  });

  it('...should be created', inject([AmplifyService], (service: AmplifyService) => {
    expect(service).toBeTruthy();
  }));

  describe('Analytics:', () => {

    it('...should be created', inject([AmplifyService], (service: AmplifyService) => {
      expect(service.analytics).toBeTruthy();
    }));
    
    it('...should be returning Amplify.Analytics', inject([AmplifyService], (service: AmplifyService) => {
      const myAnalytics = service.analytics();
      expect(myAnalytics).toEqual(Amplify.Analytics);
    }));

  });

  describe('API', () => {

    it('...should be created with an api method', inject([AmplifyService], (service: AmplifyService) => {
      expect(service.api).toBeTruthy();
    }));

    it('...should be returning Amplify.API', inject([AmplifyService], (service: AmplifyService) => {
      const myApi = service.api();
      expect(myApi).toEqual(Amplify.API);
    }));

  });

  describe('Auth', () => {

    it('...should be created with an auth method', inject([AmplifyService], (service: AmplifyService) => {
      expect(service.auth).toBeTruthy();
    }));

    it('...should be returning Amplify.Auth', inject([AmplifyService], (service: AmplifyService) => {
      const myAuth = service.auth();
      expect(myAuth).toEqual(Amplify.Auth);
    }));

  });

  describe('AuthState', () => {

    it('...should be created with an authState method', inject([AmplifyService], (service: AmplifyService) => {
      expect(service.authState).toBeTruthy();
    }));

    it('...should be returning AuthState', inject([AmplifyService], (service: AmplifyService) => {
      const myAuthState =  service.authState();
      expect(myAuthState).toEqual(new Subject<AuthState>());
    }));

    it('...should have an AuthState with a default state property equaling "signedOut"', inject([AmplifyService], (service: AmplifyService) => {
      const myAuthState =  service.authState();
      service.authStateChange$.subscribe((data) => {
        expect(data.state).toEqual('signedOut');
      })
    }));

    it('...should have an AuthState with a default user property equaling null', inject([AmplifyService], (service: AmplifyService) => {
      const myAuthState =  service.authState();
      service.authStateChange$.subscribe((data) => {
        expect(data.user).toBeNull()
      })
    }));

  });

  describe('Cache', () => {

    it('...should be created with a cache method', inject([AmplifyService], (service: AmplifyService) => {
      expect(service.cache).toBeTruthy();
    }));

    it('...should be returning Amplify.Cache', inject([AmplifyService], (service: AmplifyService) => {
      const myCache =  service.cache();
      expect(myCache).toEqual(Amplify.Cache);
    }));

  });

  describe('PubSub', () => {

    it('...should be created with a pubsub method', inject([AmplifyService], (service: AmplifyService) => {
      expect(service.pubsub).toBeTruthy();
    }));

    it('...should be returning Amplify.PubSub', inject([AmplifyService], (service: AmplifyService) => {
      const myPubSub =  service.pubsub();
      expect(myPubSub).toEqual(Amplify.PubSub);
    }));

  });

  describe('SetAuthState', () => {

    it('...should be created with a setAuthState method', inject([AmplifyService], (service: AmplifyService) => {
      expect(service.setAuthState).toBeTruthy();
    }));
    
  });

  describe('Storage', () => {

    it('...should be created with a storage method', inject([AmplifyService], (service: AmplifyService) => {
      expect(service.storage).toBeTruthy();
    }));

    it('...should be returning Amplify.Storage', inject([AmplifyService], (service: AmplifyService) => {
      const myStorage =  service.storage();
      expect(myStorage).toEqual(Amplify.Storage);
    }));

  });

  afterAll(() => {
    TestBed.resetTestEnvironment();
  });

});
