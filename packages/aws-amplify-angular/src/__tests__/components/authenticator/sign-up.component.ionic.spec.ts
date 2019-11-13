import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { FormsModule } from '@angular/forms';

import { authModule } from '../../../__mocks__/mock_module';
import { SignUpComponentIonic } from '../../../components/authenticator/sign-up-component/sign-up.component.ionic';

describe('SignUpComponentCore: ', () => {
	let component: SignUpComponentIonic;
	let fixtureComponent: SignUpComponentIonic;
	let service: AmplifyService;
	let fixture;
	let onSignUpSpy;
	let signUpSpy;
	let onSignInSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new SignUpComponentIonic(service);
		TestBed.configureTestingModule({
			declarations: [SignUpComponentIonic],
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
		fixture = TestBed.createComponent(SignUpComponentIonic);
		fixtureComponent = fixture.componentInstance;
		onSignUpSpy = jest.spyOn(fixtureComponent, 'onSignUp');
		signUpSpy = jest.spyOn(service.auth(), 'signUp');
		onSignInSpy = jest.spyOn(fixtureComponent, 'onSignIn');
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});

	it('...should have an onConfirmSignUp method', () => {
		expect(component.onConfirmSignUp).toBeTruthy();
	});

	it('...should have an onSignIn method', () => {
		expect(component.onSignIn).toBeTruthy();
	});

	it('...should have an onSignUp method', () => {
		expect(component.onSignUp).toBeTruthy();
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

	// tslint:disable:max-line-length
	it('...should call onSignUp when button is clicked (but signUp will not be called if validation does not pass)', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const button = fixture.debugElement.nativeElement.querySelector(
			'ion-button'
		);
		button.click();
		expect(onSignUpSpy).toHaveBeenCalled();
		expect(signUpSpy).not.toHaveBeenCalled();
	});

	it('...should call onSignUp when button is clicked and signUp will be called since validation passes', () => {
		fixtureComponent._show = true;
		fixtureComponent.user = {
			username: 'testusername',
			password: 'testpassword',
			email: 'testemail',
		};
		fixtureComponent.country_code = '1';
		fixtureComponent.local_phone_number = '123';
		fixture.detectChanges();
		const button = fixture.debugElement.nativeElement.querySelector(
			'ion-button'
		);
		button.click();
		expect(onSignUpSpy).toHaveBeenCalled();
		expect(signUpSpy).toHaveBeenCalled();
	});
});
