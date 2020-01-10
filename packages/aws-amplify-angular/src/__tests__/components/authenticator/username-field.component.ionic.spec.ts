import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsernameFieldComponentIonic } from '../../../components/authenticator/username-field-component/username-field.component.ionic';
import { MockComponent } from 'ng-mocks';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
import { PhoneFieldComponentIonic } from '../../../components/authenticator/phone-field-component/phone-field.component.ionic';

describe('UsernameFieldComponentCore: ', () => {
	let component: UsernameFieldComponentIonic;
	let fixtureComponent: UsernameFieldComponentIonic;
	let service: AmplifyService;
	let fixture;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new UsernameFieldComponentIonic(service);
		TestBed.configureTestingModule({
			declarations: [
				UsernameFieldComponentIonic,
				MockComponent(PhoneFieldComponentIonic),
			],
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
		fixture = TestBed.createComponent(UsernameFieldComponentIonic);
		fixtureComponent = fixture.componentInstance;
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});
});
