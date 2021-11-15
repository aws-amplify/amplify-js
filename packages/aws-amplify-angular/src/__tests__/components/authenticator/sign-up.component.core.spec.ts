import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import { By } from '@angular/platform-browser';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
import {
	SignUpComponentCore,
	SignUpField,
} from '../../../components/authenticator/sign-up-component/sign-up.component.core';
import { PhoneFieldComponentCore } from '../../../components/authenticator/phone-field-component/phone-field.component.core';
// tslint:enable

describe('SignUpComponentCore (basics): ', () => {
	let component: SignUpComponentCore;
	let service: AmplifyService;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new SignUpComponentCore(service);
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

	it('...should have an sortFields method', () => {
		expect(component.sortFields).toBeTruthy();
	});
});

describe('SignUpComponentCore (methods and UI): ', () => {
	let component: SignUpComponentCore;
	let fixture: ComponentFixture<SignUpComponentCore>;
	let service;
	let fixtureComponent: SignUpComponentCore;
	let amplifyService: AmplifyService;
	let onSignUpSpy;
	let signUpSpy;
	let onSignInSpy;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
				SignUpComponentCore,
				MockComponent(PhoneFieldComponentCore),
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
		service = new AmplifyService(authModule);
		fixture = TestBed.createComponent(SignUpComponentCore);
		fixtureComponent = fixture.componentInstance;
		component = fixture.componentInstance;
		amplifyService = TestBed.get(AmplifyService);
		onSignUpSpy = jest.spyOn(fixtureComponent, 'onSignUp');
		signUpSpy = jest.spyOn(service.auth(), 'signUp');
		onSignInSpy = jest.spyOn(fixtureComponent, 'onSignIn');
	});

	afterEach(() => {
		component.signUpConfig = undefined;
	});

	it('...should be created with 4 default signUpFields', () => {
		expect(component.signUpFields.length).toBe(4);
		expect(
			component.signUpFields.find((e) => e.key === 'username')
		).toBeTruthy();
		expect(
			component.signUpFields.find((e) => e.key === 'password')
		).toBeTruthy();
		expect(component.signUpFields.find((e) => e.key === 'email')).toBeTruthy();
		expect(
			component.signUpFields.find((e) => e.key === 'phone_number')
		).toBeTruthy();
	});

	describe('...with component ngOnInit...', () => {
		beforeEach(async () => {
			component.signUpConfig = {
				signUpFields: [
					{
						key: 'testkey',
						label: 'testlabel',
					},
				],
			};
			component.ngOnInit();
			await fixture.whenStable();
		});
		it('...should insert fields passed via signUpConfig', () => {
			expect(component.signUpFields.length).toBe(5);
			expect(
				component.signUpFields.find((e) => e.key === 'username')
			).toBeTruthy();
			expect(
				component.signUpFields.find((e) => e.key === 'password')
			).toBeTruthy();
			expect(
				component.signUpFields.find((e) => e.key === 'email')
			).toBeTruthy();
			expect(
				component.signUpFields.find((e) => e.key === 'phone_number')
			).toBeTruthy();
			expect(
				component.signUpFields.find((e) => e.key === 'testkey')
			).toBeTruthy();
		});
	});

	describe('...with component ngOnInit...', () => {
		beforeEach(async () => {
			component.signUpConfig = {
				signUpFields: [
					{
						key: 'testkey',
						label: 'testlabel',
					},
				],
			};
			component.ngOnInit();
			await fixture.whenStable();
		});
		it('...should insert only passed fields when hideDefaults is true', () => {
			component.signUpConfig = {
				hideDefaults: true,
				signUpFields: [
					{
						key: 'testkey',
						label: 'testlabel',
					},
				],
			};
			expect(component.signUpFields.length).toBe(1);
		});
	});

	describe('...with component ngOnInit...', () => {
		beforeEach(async () => {
			component.signUpConfig = {
				hiddenDefaults: ['email'],
			};
			component.ngOnInit();
			await fixture.whenStable();
		});
		it('...should exclude hiddentDefaults', () => {
			expect(component.defaultSignUpFields.length).toBe(3);
		});
	});

	describe('...with component ngOnInit...', () => {
		beforeEach(async () => {
			component.signUpConfig = {
				signUpFields: [
					{
						key: 'testkey1',
						label: 'testlabel1',
						displayOrder: 6,
					},
					{
						key: 'testkey2',
						label: 'testlabel2',
						displayOrder: 5,
					},
				],
			};
			component.ngOnInit();
			await fixture.whenStable();
		});
		it('...should order fields by display order', () => {
			expect(component.signUpFields[5].key).toBe('testkey1');
			expect(component.signUpFields[4].key).toBe('testkey2');
		});
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

	// tslint:disable:max-line-length
	it('...should call onSignUp when button is clicked (but signUp will not be called if validation does not pass)', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const button = fixture.debugElement.nativeElement.querySelector('button');
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
		const button = fixture.debugElement.nativeElement.querySelector('button');
		button.click();
		expect(onSignUpSpy).toHaveBeenCalled();
		expect(signUpSpy).toHaveBeenCalled();
	});

	it('...should call onSignIn when "amplify-form-link" is clicked', () => {
		fixtureComponent._show = true;
		fixture.detectChanges();
		const a =
			fixture.debugElement.nativeElement.querySelector('.amplify-form-link');
		a.click();
		expect(onSignInSpy).toHaveBeenCalled();
	});
});
