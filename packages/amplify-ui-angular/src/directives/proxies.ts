/* tslint:disable */
/* auto-generated angular directive proxies */
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	NgZone,
} from '@angular/core';
import { fromEvent } from 'rxjs';

export const proxyInputs = (Cmp: any, inputs: string[]) => {
	const Prototype = Cmp.prototype;
	inputs.forEach(item => {
		Object.defineProperty(Prototype, item, {
			get() {
				return this.el[item];
			},
			set(val: any) {
				this.z.runOutsideAngular(() => (this.el[item] = val));
			},
		});
	});
};

export const proxyMethods = (Cmp: any, methods: string[]) => {
	const Prototype = Cmp.prototype;
	methods.forEach(methodName => {
		Prototype[methodName] = function() {
			const args = arguments;
			return this.z.runOutsideAngular(() =>
				this.el[methodName].apply(this.el, args)
			);
		};
	});
};

export const proxyOutputs = (instance: any, el: any, events: string[]) => {
	events.forEach(eventName => (instance[eventName] = fromEvent(el, eventName)));
};

// tslint:disable-next-line: only-arrow-functions
export function ProxyCmp(opts: { inputs?: any; methods?: any }) {
	const decorator = function(cls: any) {
		if (opts.inputs) {
			proxyInputs(cls, opts.inputs);
		}
		if (opts.methods) {
			proxyMethods(cls, opts.methods);
		}
		return cls;
	};
	return decorator;
}

import { Components } from '@aws-amplify/ui-components';

export declare interface AmplifyAmazonButton
	extends Components.AmplifyAmazonButton {}
@ProxyCmp({ inputs: ['clientId', 'handleAuthStateChange', 'overrideStyle'] })
@Component({
	selector: 'amplify-amazon-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['clientId', 'handleAuthStateChange', 'overrideStyle'],
})
export class AmplifyAmazonButton {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyAuthFields
	extends Components.AmplifyAuthFields {}
@ProxyCmp({ inputs: ['formFields'] })
@Component({
	selector: 'amplify-auth-fields',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['formFields'],
})
export class AmplifyAuthFields {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyAuth0Button
	extends Components.AmplifyAuth0Button {}
@ProxyCmp({ inputs: ['config', 'handleAuthStateChange', 'overrideStyle'] })
@Component({
	selector: 'amplify-auth0-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['config', 'handleAuthStateChange', 'overrideStyle'],
})
export class AmplifyAuth0Button {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyAuthenticator
	extends Components.AmplifyAuthenticator {}
@ProxyCmp({ inputs: ['federated', 'initialAuthState'] })
@Component({
	selector: 'amplify-authenticator',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['federated', 'initialAuthState'],
})
export class AmplifyAuthenticator {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyButton extends Components.AmplifyButton {}
@ProxyCmp({ inputs: ['handleButtonClick', 'overrideStyle', 'type'] })
@Component({
	selector: 'amplify-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['handleButtonClick', 'overrideStyle', 'type'],
})
export class AmplifyButton {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyCheckbox extends Components.AmplifyCheckbox {}
@ProxyCmp({
	inputs: [
		'checked',
		'disabled',
		'fieldId',
		'label',
		'name',
		'overrideStyle',
		'value',
	],
})
@Component({
	selector: 'amplify-checkbox',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'checked',
		'disabled',
		'fieldId',
		'label',
		'name',
		'overrideStyle',
		'value',
	],
})
export class AmplifyCheckbox {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyCodeField extends Components.AmplifyCodeField {}
@ProxyCmp({
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'hint',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
@Component({
	selector: 'amplify-code-field',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'hint',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
export class AmplifyCodeField {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyConfirmSignIn
	extends Components.AmplifyConfirmSignIn {}
@ProxyCmp({
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
		'user',
		'validationErrors',
	],
})
@Component({
	selector: 'amplify-confirm-sign-in',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
		'user',
		'validationErrors',
	],
})
export class AmplifyConfirmSignIn {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyConfirmSignUp
	extends Components.AmplifyConfirmSignUp {}
@ProxyCmp({
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
		'user',
		'validationErrors',
	],
})
@Component({
	selector: 'amplify-confirm-sign-up',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
		'user',
		'validationErrors',
	],
})
export class AmplifyConfirmSignUp {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyCountryDialCode
	extends Components.AmplifyCountryDialCode {}
@ProxyCmp({
	inputs: ['fieldId', 'handleInputChange', 'options', 'overrideStyle'],
})
@Component({
	selector: 'amplify-country-dial-code',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['fieldId', 'handleInputChange', 'options', 'overrideStyle'],
})
export class AmplifyCountryDialCode {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyEmailField
	extends Components.AmplifyEmailField {}
@ProxyCmp({
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
@Component({
	selector: 'amplify-email-field',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
export class AmplifyEmailField {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyExamples extends Components.AmplifyExamples {}

@Component({
	selector: 'amplify-examples',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
})
export class AmplifyExamples {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyFacebookButton
	extends Components.AmplifyFacebookButton {}
@ProxyCmp({ inputs: ['appId', 'handleAuthStateChange', 'overrideStyle'] })
@Component({
	selector: 'amplify-facebook-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['appId', 'handleAuthStateChange', 'overrideStyle'],
})
export class AmplifyFacebookButton {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyFederatedButtons
	extends Components.AmplifyFederatedButtons {}
@ProxyCmp({
	inputs: ['authState', 'federated', 'handleAuthStateChange', 'overrideStyle'],
})
@Component({
	selector: 'amplify-federated-buttons',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['authState', 'federated', 'handleAuthStateChange', 'overrideStyle'],
})
export class AmplifyFederatedButtons {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyFederatedSignIn
	extends Components.AmplifyFederatedSignIn {}
@ProxyCmp({ inputs: ['authState', 'federated'] })
@Component({
	selector: 'amplify-federated-sign-in',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['authState', 'federated'],
})
export class AmplifyFederatedSignIn {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyForgotPassword
	extends Components.AmplifyForgotPassword {}
@ProxyCmp({
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSend',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
	],
})
@Component({
	selector: 'amplify-forgot-password',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSend',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
	],
})
export class AmplifyForgotPassword {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyFormField extends Components.AmplifyFormField {}
@ProxyCmp({
	inputs: [
		'description',
		'disabled',
		'fieldId',
		'handleInputChange',
		'hint',
		'inputProps',
		'label',
		'name',
		'overrideStyle',
		'placeholder',
		'required',
		'type',
		'value',
	],
})
@Component({
	selector: 'amplify-form-field',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'description',
		'disabled',
		'fieldId',
		'handleInputChange',
		'hint',
		'inputProps',
		'label',
		'name',
		'overrideStyle',
		'placeholder',
		'required',
		'type',
		'value',
	],
})
export class AmplifyFormField {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyFormSection
	extends Components.AmplifyFormSection {}
@ProxyCmp({
	inputs: [
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'primaryFooterContent',
		'secondaryFooterContent',
		'submitButtonText',
	],
})
@Component({
	selector: 'amplify-form-section',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'primaryFooterContent',
		'secondaryFooterContent',
		'submitButtonText',
	],
})
export class AmplifyFormSection {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyGoogleButton
	extends Components.AmplifyGoogleButton {}
@ProxyCmp({ inputs: ['clientId', 'handleAuthStateChange', 'overrideStyle'] })
@Component({
	selector: 'amplify-google-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['clientId', 'handleAuthStateChange', 'overrideStyle'],
})
export class AmplifyGoogleButton {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyGreetings extends Components.AmplifyGreetings {}
@ProxyCmp({
	inputs: ['handleAuthStateChange', 'logo', 'overrideStyle', 'user'],
})
@Component({
	selector: 'amplify-greetings',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['handleAuthStateChange', 'logo', 'overrideStyle', 'user'],
})
export class AmplifyGreetings {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyHint extends Components.AmplifyHint {}
@ProxyCmp({ inputs: ['overrideStyle'] })
@Component({
	selector: 'amplify-hint',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['overrideStyle'],
})
export class AmplifyHint {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyIcon extends Components.AmplifyIcon {}
@ProxyCmp({ inputs: ['name', 'overrideStyle'] })
@Component({
	selector: 'amplify-icon',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['name', 'overrideStyle'],
})
export class AmplifyIcon {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyIconButton
	extends Components.AmplifyIconButton {}
@ProxyCmp({ inputs: ['autoShowTooltip', 'name', 'overrideStyle', 'tooltip'] })
@Component({
	selector: 'amplify-icon-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['autoShowTooltip', 'name', 'overrideStyle', 'tooltip'],
})
export class AmplifyIconButton {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyInput extends Components.AmplifyInput {}
@ProxyCmp({
	inputs: [
		'description',
		'disabled',
		'fieldId',
		'handleInputChange',
		'inputProps',
		'name',
		'overrideStyle',
		'placeholder',
		'type',
		'value',
	],
})
@Component({
	selector: 'amplify-input',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'description',
		'disabled',
		'fieldId',
		'handleInputChange',
		'inputProps',
		'name',
		'overrideStyle',
		'placeholder',
		'type',
		'value',
	],
})
export class AmplifyInput {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyLabel extends Components.AmplifyLabel {}
@ProxyCmp({ inputs: ['htmlFor', 'overrideStyle'] })
@Component({
	selector: 'amplify-label',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['htmlFor', 'overrideStyle'],
})
export class AmplifyLabel {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyLink extends Components.AmplifyLink {}
@ProxyCmp({ inputs: ['overrideStyle', 'role'] })
@Component({
	selector: 'amplify-link',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['overrideStyle', 'role'],
})
export class AmplifyLink {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyNav extends Components.AmplifyNav {}

@Component({
	selector: 'amplify-nav',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
})
export class AmplifyNav {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyOauthButton
	extends Components.AmplifyOauthButton {}
@ProxyCmp({ inputs: ['config', 'overrideStyle'] })
@Component({
	selector: 'amplify-oauth-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['config', 'overrideStyle'],
})
export class AmplifyOauthButton {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyPasswordField
	extends Components.AmplifyPasswordField {}
@ProxyCmp({
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'hint',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
@Component({
	selector: 'amplify-password-field',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'hint',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
export class AmplifyPasswordField {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyPhoneField
	extends Components.AmplifyPhoneField {}
@ProxyCmp({
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'hint',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
@Component({
	selector: 'amplify-phone-field',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'hint',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
export class AmplifyPhoneField {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyRadioButton
	extends Components.AmplifyRadioButton {}
@ProxyCmp({
	inputs: [
		'checked',
		'disabled',
		'fieldId',
		'handleInputChange',
		'label',
		'name',
		'overrideStyle',
		'placeholder',
		'value',
	],
})
@Component({
	selector: 'amplify-radio-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'checked',
		'disabled',
		'fieldId',
		'handleInputChange',
		'label',
		'name',
		'overrideStyle',
		'placeholder',
		'value',
	],
})
export class AmplifyRadioButton {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyRequireNewPassword
	extends Components.AmplifyRequireNewPassword {}
@ProxyCmp({
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
		'user',
	],
})
@Component({
	selector: 'amplify-require-new-password',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
		'user',
	],
})
export class AmplifyRequireNewPassword {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyScene extends Components.AmplifyScene {}
@ProxyCmp({ inputs: ['sceneName'] })
@Component({
	selector: 'amplify-scene',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['sceneName'],
})
export class AmplifyScene {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifySceneLoading
	extends Components.AmplifySceneLoading {}
@ProxyCmp({ inputs: ['loadPercentage', 'sceneError', 'sceneName'] })
@Component({
	selector: 'amplify-scene-loading',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['loadPercentage', 'sceneError', 'sceneName'],
})
export class AmplifySceneLoading {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifySection extends Components.AmplifySection {}
@ProxyCmp({ inputs: ['overrideStyle', 'role'] })
@Component({
	selector: 'amplify-section',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['overrideStyle', 'role'],
})
export class AmplifySection {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifySelect extends Components.AmplifySelect {}
@ProxyCmp({
	inputs: ['fieldId', 'handleInputChange', 'options', 'overrideStyle'],
})
@Component({
	selector: 'amplify-select',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['fieldId', 'handleInputChange', 'options', 'overrideStyle'],
})
export class AmplifySelect {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifySelectMfaType
	extends Components.AmplifySelectMfaType {}
@ProxyCmp({ inputs: ['MFATypes', 'authData', 'handleSubmit'] })
@Component({
	selector: 'amplify-select-mfa-type',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['MFATypes', 'authData', 'handleSubmit'],
})
export class AmplifySelectMfaType {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifySignIn extends Components.AmplifySignIn {}
@ProxyCmp({
	inputs: [
		'federated',
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
		'validationErrors',
	],
})
@Component({
	selector: 'amplify-sign-in',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'federated',
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'headerText',
		'overrideStyle',
		'submitButtonText',
		'validationErrors',
	],
})
export class AmplifySignIn {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifySignInButton
	extends Components.AmplifySignInButton {}
@ProxyCmp({ inputs: ['overrideStyle', 'provider'] })
@Component({
	selector: 'amplify-sign-in-button',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['overrideStyle', 'provider'],
})
export class AmplifySignInButton {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifySignOut extends Components.AmplifySignOut {}
@ProxyCmp({ inputs: ['buttonText', 'handleAuthStateChange', 'overrideStyle'] })
@Component({
	selector: 'amplify-sign-out',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['buttonText', 'handleAuthStateChange', 'overrideStyle'],
})
export class AmplifySignOut {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifySignUp extends Components.AmplifySignUp {}
@ProxyCmp({
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'haveAccountText',
		'headerText',
		'overrideStyle',
		'signInText',
		'submitButtonText',
		'validationErrors',
	],
})
@Component({
	selector: 'amplify-sign-up',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'formFields',
		'handleAuthStateChange',
		'handleSubmit',
		'haveAccountText',
		'headerText',
		'overrideStyle',
		'signInText',
		'submitButtonText',
		'validationErrors',
	],
})
export class AmplifySignUp {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyStrike extends Components.AmplifyStrike {}
@ProxyCmp({ inputs: ['overrideStyle'] })
@Component({
	selector: 'amplify-strike',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['overrideStyle'],
})
export class AmplifyStrike {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyToast extends Components.AmplifyToast {}
@ProxyCmp({ inputs: ['onClose'] })
@Component({
	selector: 'amplify-toast',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['onClose'],
})
export class AmplifyToast {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyTooltip extends Components.AmplifyTooltip {}
@ProxyCmp({ inputs: ['overrideStyle', 'shouldAutoShow', 'text'] })
@Component({
	selector: 'amplify-tooltip',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['overrideStyle', 'shouldAutoShow', 'text'],
})
export class AmplifyTooltip {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyTotpSetup extends Components.AmplifyTotpSetup {}
@ProxyCmp({ inputs: ['handleAuthStateChange', 'user'] })
@Component({
	selector: 'amplify-totp-setup',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['handleAuthStateChange', 'user'],
})
export class AmplifyTotpSetup {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyUsernameField
	extends Components.AmplifyUsernameField {}
@ProxyCmp({
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
@Component({
	selector: 'amplify-username-field',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: [
		'disabled',
		'fieldId',
		'handleInputChange',
		'inputProps',
		'label',
		'placeholder',
		'required',
		'value',
	],
})
export class AmplifyUsernameField {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface AmplifyVerifyContact
	extends Components.AmplifyVerifyContact {}
@ProxyCmp({ inputs: ['handleAuthStateChange', 'overrideStyle', 'user'] })
@Component({
	selector: 'amplify-verify-contact',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['handleAuthStateChange', 'overrideStyle', 'user'],
})
export class AmplifyVerifyContact {
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
	}
}

export declare interface RockPaperScissor extends Components.RockPaperScissor {}
@ProxyCmp({ inputs: ['icon'] })
@Component({
	selector: 'rock-paper-scissor',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<ng-content></ng-content>',
	inputs: ['icon'],
})
export class RockPaperScissor {
	iconChange!: EventEmitter<CustomEvent>;
	protected el: HTMLElement;
	constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
		c.detach();
		this.el = r.nativeElement;
		proxyOutputs(this, this.el, ['iconChange']);
	}
}
