import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { authDecorator }  from '../../providers/auth.decorator';

describe('AuthDecorator', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [authDecorator]
    });
  });

  it('should be created',  () => {
    expect(authDecorator).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestEnvironment();
  });
});
