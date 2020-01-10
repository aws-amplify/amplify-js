import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
import { ForgotPasswordComponentCore } from '../../../components/authenticator/forgot-password-component/forgot-password.component.core';
import { UsernameFieldComponentCore } from '../../../components/authenticator/username-field-component/username-field.component.core';

describe('ForgotPasswordComponentCore: ', () => {
	let component: ForgotPasswordComponentCore;
	let fixtureComponent: ForgotPasswordComponentCore;
	let service: AmplifyService;
	let fixture;
	let onSubmitSpy;
	let onSendSpy;
	let forgotPasswordSpy;
	let forgotPasswordSubmitSpy;
	let onSignInSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new ForgotPasswordComponentCore(service);
		TestBed.configureTestingModule({
			declarations: [
				ForgotPasswordComponentCore,
				MockComponent(UsernameFieldComponentCore),
			],
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
			imports: [FormsModule],
		}).compileComponents();
		fixture = TestBed.createComponent(ForgotPasswordComponentCore);
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
			'.amplify-container'
		);
		expect(rootEl).toBeFalsy();
	});

	it('...should display if _show is set', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const rootEl = fixture.debugElement.nativeElement.querySelector(
			'.amplify-container'
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
		const button = fixture.debugElement.nativeElement.querySelector(
			'.amplify-form-button'
		);
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
		const button = fixture.debugElement.nativeElement.querySelector(
			'.amplify-form-button'
		);
		button.click();
		expect(onSubmitSpy).toHaveBeenCalled();
		expect(forgotPasswordSubmitSpy).toHaveBeenCalled();
	});

	it('...should call onSend when a tag is clicked and codeSent', () => {
		fixtureComponent._show = true;
		fixtureComponent.code_sent = true;
		fixtureComponent._authState = {
			state: 'requireNewPassword',
			user: {},
		};
		fixture.detectChanges();
		const a = fixture.debugElement.nativeElement.querySelector(
			'.amplify-form-link'
		);
		a.click();
		expect(onSendSpy).toHaveBeenCalled();
		expect(forgotPasswordSpy).toHaveBeenCalled();
	});

	it('...should call onSignIn when a tag is clicked and !codeSent', () => {
		fixtureComponent._show = true;
		fixtureComponent._authState = {
			state: 'requireNewPassword',
			user: {},
		};
		fixture.detectChanges();
		const a = fixture.debugElement.nativeElement.querySelector(
			'.amplify-form-link'
		);
		a.click();
		expect(onSignInSpy).toHaveBeenCalled();
	});
});
