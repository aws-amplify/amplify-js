import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { AmplifyAngularModule } from '../../../aws-amplify-angular.module';
import { authModule } from '../../../__mocks__/mock_module';
import { ConfirmSignInComponentCore } from '../../../components/authenticator/confirm-sign-in-component/confirm-sign-in-component.core';

describe('ConfirmSignInComponentCore: ', () => {
	let component: ConfirmSignInComponentCore;
	let fixtureComponent: ConfirmSignInComponentCore;
	let service: AmplifyService;
	let fixture;
	let setAuthStateSpy;
	let confirmSignInSpy;
	let onConfirmSpy;
	let onSignInSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new ConfirmSignInComponentCore(service);
		setAuthStateSpy = jest.spyOn(service, 'setAuthState');
		confirmSignInSpy = jest.spyOn(service.auth(), 'confirmSignIn');
		TestBed.configureTestingModule({
			declarations: [ConfirmSignInComponentCore],
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
		fixture = TestBed.createComponent(ConfirmSignInComponentCore);
		fixtureComponent = fixture.componentInstance;
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

	it('...should have a setCode method', () => {
		expect(component.setCode).toBeTruthy();
	});

	it('...should have a code property that is initally undefined', () => {
		expect(component.code).toBeUndefined();
	});

	it("...the setCode method should set the component's code property", () => {
		component.setCode('200');
		expect(component.code).toEqual('200');
	});

	it('...should have an onConfirm method', () => {
		expect(component.onConfirm).toBeTruthy();
	});

	it('...should call confirmSignIn within the onConfirm method', () => {
		component._authState = {
			user: { challengeName: 'test-challange-name' },
			state: 'test-state',
		};
		const callingAuthState = component.onConfirm();
		expect(service.auth().confirmSignIn).toBeCalled();
	});

	it('...should have an onSignIn method', () => {
		expect(component.onSignIn).toBeTruthy();
	});

	it('...should call setAuthState within the onSignIn method', () => {
		const callingAuthState = component.onSignIn();
		expect(service.setAuthState).toBeCalled();
	});

	it('...should have a _setError method', () => {
		expect(component._setError).toBeTruthy();
	});

	it('...should not display if _show is not set', () => {
		const rootEl =
			fixture.debugElement.nativeElement.querySelector('.amplify-container');
		expect(rootEl).toBeFalsy();
	});

	it('...should display if _show is set', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const rootEl =
			fixture.debugElement.nativeElement.querySelector('.amplify-container');
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
		expect(confirmSignInSpy).toHaveBeenCalled();
	});

	it('...should call onSignIn when "a" tag is clicked', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const a =
			fixture.debugElement.nativeElement.querySelector('.amplify-form-link');
		a.click();
		expect(onSignInSpy).toHaveBeenCalled();
	});
});
