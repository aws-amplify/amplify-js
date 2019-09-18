import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
import { ConfirmSignUpComponentIonic } from '../../../components/authenticator/confirm-sign-up-component/confirm-sign-up.component.ionic';

describe('ConfirmSignUpComponentIonic: ', () => {
	let component: ConfirmSignUpComponentIonic;
	let fixtureComponent: ConfirmSignUpComponentIonic;
	let service: AmplifyService;
	let fixture;
	let onSignInSpy;
	let onConfirmSpy;
	let confirmSignUpSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new ConfirmSignUpComponentIonic(service);
		TestBed.configureTestingModule({
			declarations: [ConfirmSignUpComponentIonic],
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
		fixture = TestBed.createComponent(ConfirmSignUpComponentIonic);
		fixtureComponent = fixture.componentInstance;
		confirmSignUpSpy = jest.spyOn(service.auth(), 'confirmSignUp');
		onConfirmSpy = jest.spyOn(fixtureComponent, 'onConfirm');
		onSignInSpy = jest.spyOn(fixtureComponent, 'onSignIn');
	});

	afterEach(() => {
		service = null;
		component = null;
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

	it('...should call onConfirm when ion-button is clicked', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const button = fixture.debugElement.nativeElement.querySelector(
			'ion-button'
		);
		button.click();
		expect(onConfirmSpy).toHaveBeenCalled();
		expect(confirmSignUpSpy).toHaveBeenCalled();
	});
});
