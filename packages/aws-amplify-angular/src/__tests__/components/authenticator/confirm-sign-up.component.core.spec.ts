import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
import { ConfirmSignUpComponentCore } from '../../../components/authenticator/confirm-sign-up-component/confirm-sign-up.component.core';

describe('ConfirmSignUpComponentCore: ', () => {
	let component: ConfirmSignUpComponentCore;
	let fixtureComponent: ConfirmSignUpComponentCore;
	let service: AmplifyService;
	let fixture;
	let onSignInSpy;
	let onConfirmSpy;
	let confirmSignUpSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new ConfirmSignUpComponentCore(service);
		TestBed.configureTestingModule({
			declarations: [ConfirmSignUpComponentCore],
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
		fixture = TestBed.createComponent(ConfirmSignUpComponentCore);
		fixtureComponent = fixture.componentInstance;
		confirmSignUpSpy = jest.spyOn(service.auth(), 'confirmSignUp');
		onConfirmSpy = jest.spyOn(fixtureComponent, 'onConfirm');
		onSignInSpy = jest.spyOn(fixtureComponent, 'onSignIn');
	});

	afterEach(() => {
		service = null;
		component = null;
		fixtureComponent = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});

	it('...should have an onConfirm method', () => {
		expect(component.onConfirm).toBeTruthy();
	});

	it('...should have an onResend method', () => {
		expect(component.onResend).toBeTruthy();
	});

	it('...should have an onSignIn method', () => {
		expect(component.onSignIn).toBeTruthy();
	});

	it('...should have an setCode method', () => {
		expect(component.setCode).toBeTruthy();
	});

	it('...should have an setUsername method', () => {
		expect(component.setUsername).toBeTruthy();
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

	it('...should call onConfirm when button is clicked', () => {
		fixtureComponent._show = true;
		fixtureComponent._authState = {
			state: 'confirmSignIn',
			user: {},
		};
		fixture.detectChanges();
		const button = fixture.debugElement.nativeElement.querySelector(
			'.amplify-form-button'
		);
		button.click();
		expect(onConfirmSpy).toHaveBeenCalled();
		expect(confirmSignUpSpy).toHaveBeenCalled();
	});

	it('...should call onSignIn when "a" tag is clicked', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const parent = fixture.debugElement.nativeElement.querySelector(
			'.amplify-form-actions-left'
		);
		const a = parent.querySelector('.amplify-form-link');
		a.click();
		expect(onSignInSpy).toHaveBeenCalled();
	});
});
