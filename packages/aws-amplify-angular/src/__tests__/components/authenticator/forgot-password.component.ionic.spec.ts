import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
import { ForgotPasswordComponentIonic } from '../../../components/authenticator/forgot-password-component/forgot-password.component.ionic';

describe('ForgotPasswordComponentIonic: ', () => {
	let component: ForgotPasswordComponentIonic;
	let fixtureComponent: ForgotPasswordComponentIonic;
	let service: AmplifyService;
	let fixture;
	let onSubmitSpy;
	let onSendSpy;
	let forgotPasswordSpy;
	let forgotPasswordSubmitSpy;
	let onSignInSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new ForgotPasswordComponentIonic(service);
		TestBed.configureTestingModule({
			declarations: [ForgotPasswordComponentIonic],
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
		fixture = TestBed.createComponent(ForgotPasswordComponentIonic);
		fixtureComponent = fixture.componentInstance;
		forgotPasswordSpy = jest.spyOn(service.auth(), 'forgotPassword');
		forgotPasswordSubmitSpy = jest.spyOn(
			service.auth(),
			'forgotPasswordSubmit'
		);
		onSubmitSpy = jest.spyOn(fixtureComponent, 'onSubmit');
		onSendSpy = jest.spyOn(fixtureComponent, 'onSend');
		onSignInSpy = jest.spyOn(fixtureComponent, 'onSignIn');
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});

	it('...should have an onSend method', () => {
		expect(component.onSend).toBeTruthy();
	});

	it('...should have an onSignIn method', () => {
		expect(component.onSignIn).toBeTruthy();
	});

	it('...should have an onSubmit method', () => {
		expect(component.onSubmit).toBeTruthy();
	});

	it('...should have an setCode method', () => {
		expect(component.setCode).toBeTruthy();
	});

	it('...should have an _setError method', () => {
		expect(component._setError).toBeTruthy();
	});

	it('...should not display if _show is not set', () => {
		const rootEl = fixture.debugElement.nativeElement.querySelector(
			'.amplify-authenticator-ionic'
		);
		expect(rootEl).toBeFalsy();
	});

	it('...should display if _show is set', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const rootEl = fixture.debugElement.nativeElement.querySelector(
			'.amplify-authenticator-ionic'
		);
		expect(rootEl).toBeTruthy();
	});

	it('...should call onSend when button is clicked and !codeSent', () => {
		fixtureComponent._show = true;
		fixtureComponent._authState = {
			state: 'requireNewPassword',
			user: {},
		};
		fixture.detectChanges();
		const button =
			fixture.debugElement.nativeElement.querySelector('ion-button');
		button.click();
		expect(forgotPasswordSpy).not.toHaveBeenCalled();
		expect(onSendSpy).toHaveBeenCalled();
		fixtureComponent.username = 'username';
		fixture.detectChanges();
		button.click();
		expect(forgotPasswordSpy).toHaveBeenCalled();
	});

	it('...should call onSubmit when button is clicked and codeSent', () => {
		fixtureComponent._show = true;
		fixtureComponent.code_sent = true;
		fixtureComponent._authState = {
			state: 'requireNewPassword',
			user: {},
		};
		fixture.detectChanges();
		const button =
			fixture.debugElement.nativeElement.querySelector('ion-button');
		button.click();
		expect(onSubmitSpy).toHaveBeenCalled();
		expect(forgotPasswordSubmitSpy).toHaveBeenCalled();
	});
});
