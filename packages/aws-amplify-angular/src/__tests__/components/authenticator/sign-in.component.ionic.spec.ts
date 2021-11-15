import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
import { SignInComponentIonic } from '../../../components/authenticator/sign-in-component/sign-in.component.ionic';
import Amplify from 'aws-amplify';

describe('SignInComponentIonic: ', () => {
	let component: SignInComponentIonic;
	let fixtureComponent: SignInComponentIonic;
	let fixture;
	let service: AmplifyService;
	let setAuthStateSpy;
	let signInSpy;
	let onSignInSpy;
	let onSignUpSpy;
	let onForgotPasswordSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new SignInComponentIonic(service);
		setAuthStateSpy = jest.spyOn(service, 'setAuthState');
		signInSpy = jest.spyOn(service.auth(), 'signIn');
		TestBed.configureTestingModule({
			declarations: [SignInComponentIonic],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{
					provide: AmplifyService,
					useFactory: () => {
						return AmplifyModules({
							...authModule,
						});
					},
				},
			],
		}).compileComponents();
		fixture = TestBed.createComponent(SignInComponentIonic);
		fixtureComponent = fixture.componentInstance;
		onSignInSpy = jest.spyOn(fixtureComponent, 'onSignIn');
		onSignUpSpy = jest.spyOn(fixtureComponent, 'onSignUp');
		onForgotPasswordSpy = jest.spyOn(fixtureComponent, 'onForgotPassword');
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});

	it('...should have an onForgotPassword method', () => {
		expect(component.onForgotPassword).toBeTruthy();
	});

	it('...should call setAuthState within the onForgotPassword method', () => {
		component.username = 'test-username2';
		const callingAuthState = component.onForgotPassword();
		expect(service.setAuthState).toBeCalled();
		setAuthStateSpy.mockRestore();
	});

	it('...should have an onSignIn method', () => {
		expect(component.onSignIn).toBeTruthy();
	});

	it('...should call signIn within the onSignUp method', () => {
		component.username = 'test-username3';
		component.password = 'test-password3';
		const callingAuthState = component.onSignIn();
		expect(signInSpy).toBeCalled();
	});

	it('...should have an onSignUp method', () => {
		expect(component.onSignUp).toBeTruthy();
	});

	it('...should call setAuthState within the onSignUp method', () => {
		component.username = 'test-username2';
		const callingAuthState = component.onSignUp();
		expect(service.setAuthState).toBeCalled();
		setAuthStateSpy.mockRestore();
	});

	it('...should have a setPassword method', () => {
		expect(component.setPassword).toBeTruthy();
	});

	it('...should set this.password with the setPassword method', () => {
		component.setPassword('my-test-password');
		expect(component.password).toEqual('my-test-password');
	});

	it('...should have a setUsername method', () => {
		expect(component.setUsername).toBeTruthy();
	});

	it('...should set this.username with the setUsername method', () => {
		component.setUsername('my-test-name');
		expect(component.username).toEqual('my-test-name');
	});

	it('...should not display if _show is not set', () => {
		const rootEl = fixture.debugElement.nativeElement.querySelector(
			'.amplify-authenticator'
		);
		expect(rootEl).toBeFalsy();
	});

	it('...should display if _show is set', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const rootEl = fixture.debugElement.nativeElement.querySelector(
			'.amplify-authenticator'
		);
		expect(rootEl).toBeTruthy();
	});

	it('...should call onSignIn when button is clicked', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const button =
			fixture.debugElement.nativeElement.querySelector('ion-button');
		button.click();
		expect(onSignInSpy).toHaveBeenCalled();
		expect(signInSpy).toHaveBeenCalled();
	});

	it('...should call onSignUp when "No account?" element is clicked', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const parent = fixture.debugElement.nativeElement.querySelector(
			'.amplify-form-signup'
		);
		const a = parent.querySelector('.amplify-form-link');
		a.click();
		expect(onSignUpSpy).toHaveBeenCalled();
	});
});
