import { Component, NgModule, ComponentFactoryResolver } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { CommonModule } from '@angular/common';  
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { AuthenticatorComponent } from '../../../components/authenticator/index';
import { AmplifyAngularModule } from '../../../aws-amplify-angular.module';
import { AmplifyIonicModule } from '../../../aws-amplify-ionic-module';



describe('AuthenticatorComponent: ', () => {

  let component: AuthenticatorComponent;
  let service: AmplifyService;
  let componentFactoryResolver: ComponentFactoryResolver;
  let testHostComponent: TestHostComponent;

  let testHostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [AmplifyAngularModule]
    })
      .compileComponents();
  }));

  beforeEach(() => { 
    service = new AmplifyService();
    component = new AuthenticatorComponent(componentFactoryResolver);
    testHostFixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = testHostFixture.componentInstance;
    testHostFixture.detectChanges();
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have a loadComponent function', () => {
    expect(component.loadComponent).toBeTruthy();
  });

  it('...should have a sign-in component', () => {
    expect(testHostFixture.nativeElement.querySelector('amplify-auth-sign-in-core')).toBeTruthy();
  });

  it('...should have a sign-up component', () => {
    expect(testHostFixture.nativeElement.querySelector('amplify-auth-sign-up-core')).toBeTruthy();
  });

  it('...should have a forgot-password component', () => {
    expect(testHostFixture.nativeElement.querySelector('amplify-auth-forgot-password-core')).toBeTruthy();
  });

  it('...should have a confirm-sign-in component', () => {
    expect(testHostFixture.nativeElement.querySelector('amplify-auth-confirm-sign-in-core')).toBeTruthy();
  });

  it('...should have a confirm-sign-up component', () => {
    expect(testHostFixture.nativeElement.querySelector('amplify-auth-confirm-sign-up-core')).toBeTruthy();
  });

  it('...should have a require-password component', () => {
    expect(testHostFixture.nativeElement.querySelector('amplify-auth-require-new-password-core')).toBeTruthy();
  });

  it('...should have a component host', () =>{
    expect(component.componentHost)
  })

  @Component({
    selector: `host-component`,
    template: `<amplify-authenticator></amplify-authenticator>`
  })
  class TestHostComponent {
  }

});