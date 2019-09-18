import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhoneFieldComponentIonic } from '../../../components/authenticator/phone-field-component/phone-field.component.ionic';
import { MockComponent } from 'ng-mocks';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';

describe('PhoneFieldComponentIonic: ', () => {
	let component: PhoneFieldComponentIonic;
	let fixtureComponent: PhoneFieldComponentIonic;
	let service: AmplifyService;
	let fixture;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new PhoneFieldComponentIonic(service);
		TestBed.configureTestingModule({
			declarations: [PhoneFieldComponentIonic],
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
		fixture = TestBed.createComponent(PhoneFieldComponentIonic);
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
