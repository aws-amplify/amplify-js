import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
// tslint:disable:max-line-length
import { RequireNewPasswordComponentIonic } from '../../../components/authenticator/require-new-password-component/require-new-password.component.ionic';
// tslint:enable

describe('RequireNewPasswordComponentCore: ', () => {
	let component: RequireNewPasswordComponentIonic;
	let fixtureComponent: RequireNewPasswordComponentIonic;
	let service: AmplifyService;
	let fixture;
	let onSubmitSpy;
	let completeNewPasswordSpy;
	let onSignInSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new RequireNewPasswordComponentIonic(service);
		TestBed.configureTestingModule({
			declarations: [RequireNewPasswordComponentIonic],
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
		fixture = TestBed.createComponent(RequireNewPasswordComponentIonic);
		fixtureComponent = fixture.componentInstance;
		completeNewPasswordSpy = jest.spyOn(service.auth(), 'completeNewPassword');
		onSubmitSpy = jest.spyOn(fixtureComponent, 'onSubmit');
		onSignInSpy = jest.spyOn(fixtureComponent, 'onSignIn');
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});

	it('...should have an onSignIn method', () => {
		expect(component.onSignIn).toBeTruthy();
	});

	it('...should have an onSubmit method', () => {
		expect(component.onSubmit).toBeTruthy();
	});

	it('...should have a setPassword method', () => {
		expect(component.setPassword).toBeTruthy();
	});

	it('...should have a _setError method', () => {
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

	it('...should call onSignIn when button is clicked', () => {
		fixtureComponent._show = true;
		fixtureComponent.authState = {
			state: 'requireNewPassword',
			user: { challengeParam: {} },
		};
		fixture.detectChanges();
		const buttons = fixture.debugElement.nativeElement.querySelectorAll(
			'ion-button'
		);
		const signInButton = Object.values(buttons).find(
			el => (el as HTMLElement).innerHTML === 'Back to Sign In'
		);
		(signInButton as HTMLElement).click();
		expect(onSignInSpy).toHaveBeenCalled();
	});

	it('...should call onSubmit when button is clicked', () => {
		fixtureComponent._show = true;
		fixtureComponent.authState = {
			state: 'requireNewPassword',
			user: { challengeParam: {} },
		};
		fixture.detectChanges();
		const buttons = fixture.debugElement.nativeElement.querySelectorAll(
			'ion-button'
		);
		const submitButton = Object.values(buttons).find(
			el => (el as any).innerHTML === 'Submit'
		);
		(submitButton as any).click();
		expect(onSubmitSpy).toHaveBeenCalled();
	});
});
