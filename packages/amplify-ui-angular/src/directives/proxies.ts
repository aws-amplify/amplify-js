/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone } from '@angular/core';
import { fromEvent } from 'rxjs';

export const proxyInputs = (Cmp: any, inputs: string[]) => {
  const Prototype = Cmp.prototype;
  inputs.forEach(item => {
    Object.defineProperty(Prototype, item, {
      get() { return this.el[item]; },
      set(val: any) { this.z.runOutsideAngular(() => (this.el[item] = val)); }
    });
  });
};

export const proxyMethods = (Cmp: any, methods: string[]) => {
  const Prototype = Cmp.prototype;
  methods.forEach(methodName => {
    Prototype[methodName] = function () {
      const args = arguments;
      return this.z.runOutsideAngular(() => this.el[methodName].apply(this.el, args));
    };
  });
};

export const proxyOutputs = (instance: any, el: any, events: string[]) => {
  events.forEach(eventName => instance[eventName] = fromEvent(el, eventName));
}

// tslint:disable-next-line: only-arrow-functions
export function ProxyCmp(opts: { inputs?: any; methods?: any }) {
  const decorator =  function(cls: any){
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

import { Components } from '@aws-amplify/ui-components'

export declare interface AmplifyAmazonButton extends Components.AmplifyAmazonButton {}
@ProxyCmp({inputs: ['clientId', 'handleAuthStateChange']})
@Component({ selector: 'amplify-amazon-button', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['clientId', 'handleAuthStateChange'] })
export class AmplifyAmazonButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyAuthContainer extends Components.AmplifyAuthContainer {}

@Component({ selector: 'amplify-auth-container', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>' })
export class AmplifyAuthContainer {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyAuthFields extends Components.AmplifyAuthFields {}
@ProxyCmp({inputs: ['formFields']})
@Component({ selector: 'amplify-auth-fields', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['formFields'] })
export class AmplifyAuthFields {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyAuth0Button extends Components.AmplifyAuth0Button {}
@ProxyCmp({inputs: ['config', 'handleAuthStateChange']})
@Component({ selector: 'amplify-auth0-button', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['config', 'handleAuthStateChange'] })
export class AmplifyAuth0Button {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyAuthenticator extends Components.AmplifyAuthenticator {}
@ProxyCmp({inputs: ['federated', 'handleAuthStateChange', 'hideToast', 'initialAuthState', 'usernameAlias']})
@Component({ selector: 'amplify-authenticator', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['federated', 'handleAuthStateChange', 'hideToast', 'initialAuthState', 'usernameAlias'] })
export class AmplifyAuthenticator {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyButton extends Components.AmplifyButton {}
@ProxyCmp({inputs: ['disabled', 'handleButtonClick', 'icon', 'type', 'variant']})
@Component({ selector: 'amplify-button', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['disabled', 'handleButtonClick', 'icon', 'type', 'variant'] })
export class AmplifyButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyChatbot extends Components.AmplifyChatbot {}
@ProxyCmp({inputs: ['botName', 'botTitle', 'clearOnComplete', 'conversationModeOn', 'silenceThreshold', 'silenceTime', 'textEnabled', 'voiceEnabled', 'welcomeMessage']})
@Component({ selector: 'amplify-chatbot', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['botName', 'botTitle', 'clearOnComplete', 'conversationModeOn', 'silenceThreshold', 'silenceTime', 'textEnabled', 'voiceEnabled', 'welcomeMessage'] })
export class AmplifyChatbot {
  chatCompleted!: EventEmitter<CustomEvent>;
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['chatCompleted']);
  }
}

export declare interface AmplifyCheckbox extends Components.AmplifyCheckbox {}
@ProxyCmp({inputs: ['checked', 'disabled', 'fieldId', 'label', 'name', 'value']})
@Component({ selector: 'amplify-checkbox', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['checked', 'disabled', 'fieldId', 'label', 'name', 'value'] })
export class AmplifyCheckbox {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyCodeField extends Components.AmplifyCodeField {}
@ProxyCmp({inputs: ['disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value']})
@Component({ selector: 'amplify-code-field', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value'] })
export class AmplifyCodeField {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyConfirmSignIn extends Components.AmplifyConfirmSignIn {}
@ProxyCmp({inputs: ['formFields', 'handleAuthStateChange', 'handleSubmit', 'headerText', 'submitButtonText', 'user']})
@Component({ selector: 'amplify-confirm-sign-in', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['formFields', 'handleAuthStateChange', 'handleSubmit', 'headerText', 'submitButtonText', 'user'] })
export class AmplifyConfirmSignIn {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyConfirmSignUp extends Components.AmplifyConfirmSignUp {}
@ProxyCmp({inputs: ['formFields', 'handleAuthStateChange', 'handleSubmit', 'headerText', 'submitButtonText', 'user', 'usernameAlias']})
@Component({ selector: 'amplify-confirm-sign-up', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['formFields', 'handleAuthStateChange', 'handleSubmit', 'headerText', 'submitButtonText', 'user', 'usernameAlias'] })
export class AmplifyConfirmSignUp {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyContainer extends Components.AmplifyContainer {}

@Component({ selector: 'amplify-container', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>' })
export class AmplifyContainer {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyCountryDialCode extends Components.AmplifyCountryDialCode {}
@ProxyCmp({inputs: ['dialCode', 'fieldId', 'handleInputChange', 'options']})
@Component({ selector: 'amplify-country-dial-code', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['dialCode', 'fieldId', 'handleInputChange', 'options'] })
export class AmplifyCountryDialCode {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyEmailField extends Components.AmplifyEmailField {}
@ProxyCmp({inputs: ['disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value']})
@Component({ selector: 'amplify-email-field', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value'] })
export class AmplifyEmailField {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyFacebookButton extends Components.AmplifyFacebookButton {}
@ProxyCmp({inputs: ['appId', 'handleAuthStateChange']})
@Component({ selector: 'amplify-facebook-button', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['appId', 'handleAuthStateChange'] })
export class AmplifyFacebookButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyFederatedButtons extends Components.AmplifyFederatedButtons {}
@ProxyCmp({inputs: ['authState', 'federated', 'handleAuthStateChange']})
@Component({ selector: 'amplify-federated-buttons', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['authState', 'federated', 'handleAuthStateChange'] })
export class AmplifyFederatedButtons {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyFederatedSignIn extends Components.AmplifyFederatedSignIn {}
@ProxyCmp({inputs: ['authState', 'federated']})
@Component({ selector: 'amplify-federated-sign-in', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['authState', 'federated'] })
export class AmplifyFederatedSignIn {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyForgotPassword extends Components.AmplifyForgotPassword {}
@ProxyCmp({inputs: ['formFields', 'handleAuthStateChange', 'handleSend', 'handleSubmit', 'headerText', 'sendButtonText', 'submitButtonText', 'usernameAlias']})
@Component({ selector: 'amplify-forgot-password', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['formFields', 'handleAuthStateChange', 'handleSend', 'handleSubmit', 'headerText', 'sendButtonText', 'submitButtonText', 'usernameAlias'] })
export class AmplifyForgotPassword {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyFormField extends Components.AmplifyFormField {}
@ProxyCmp({inputs: ['description', 'disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'name', 'placeholder', 'required', 'type', 'value']})
@Component({ selector: 'amplify-form-field', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['description', 'disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'name', 'placeholder', 'required', 'type', 'value'] })
export class AmplifyFormField {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyFormSection extends Components.AmplifyFormSection {}
@ProxyCmp({inputs: ['handleSubmit', 'headerText', 'loading', 'secondaryFooterContent', 'submitButtonText', 'testDataPrefix']})
@Component({ selector: 'amplify-form-section', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['handleSubmit', 'headerText', 'loading', 'secondaryFooterContent', 'submitButtonText', 'testDataPrefix'] })
export class AmplifyFormSection {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyGoogleButton extends Components.AmplifyGoogleButton {}
@ProxyCmp({inputs: ['clientId', 'handleAuthStateChange']})
@Component({ selector: 'amplify-google-button', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['clientId', 'handleAuthStateChange'] })
export class AmplifyGoogleButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyGreetings extends Components.AmplifyGreetings {}
@ProxyCmp({inputs: ['handleAuthStateChange', 'logo', 'username']})
@Component({ selector: 'amplify-greetings', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['handleAuthStateChange', 'logo', 'username'] })
export class AmplifyGreetings {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyHint extends Components.AmplifyHint {}

@Component({ selector: 'amplify-hint', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>' })
export class AmplifyHint {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyIcon extends Components.AmplifyIcon {}
@ProxyCmp({inputs: ['name']})
@Component({ selector: 'amplify-icon', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['name'] })
export class AmplifyIcon {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyIconButton extends Components.AmplifyIconButton {}
@ProxyCmp({inputs: ['autoShowTooltip', 'name', 'tooltip']})
@Component({ selector: 'amplify-icon-button', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['autoShowTooltip', 'name', 'tooltip'] })
export class AmplifyIconButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyInput extends Components.AmplifyInput {}
@ProxyCmp({inputs: ['description', 'disabled', 'fieldId', 'handleInputChange', 'inputProps', 'name', 'placeholder', 'required', 'type', 'value']})
@Component({ selector: 'amplify-input', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['description', 'disabled', 'fieldId', 'handleInputChange', 'inputProps', 'name', 'placeholder', 'required', 'type', 'value'] })
export class AmplifyInput {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyLabel extends Components.AmplifyLabel {}
@ProxyCmp({inputs: ['htmlFor']})
@Component({ selector: 'amplify-label', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['htmlFor'] })
export class AmplifyLabel {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyLink extends Components.AmplifyLink {}
@ProxyCmp({inputs: ['role']})
@Component({ selector: 'amplify-link', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['role'] })
export class AmplifyLink {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyLoadingSpinner extends Components.AmplifyLoadingSpinner {}

@Component({ selector: 'amplify-loading-spinner', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>' })
export class AmplifyLoadingSpinner {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyNav extends Components.AmplifyNav {}

@Component({ selector: 'amplify-nav', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>' })
export class AmplifyNav {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyOauthButton extends Components.AmplifyOauthButton {}
@ProxyCmp({inputs: ['config']})
@Component({ selector: 'amplify-oauth-button', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['config'] })
export class AmplifyOauthButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyPasswordField extends Components.AmplifyPasswordField {}
@ProxyCmp({inputs: ['disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value']})
@Component({ selector: 'amplify-password-field', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value'] })
export class AmplifyPasswordField {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyPhoneField extends Components.AmplifyPhoneField {}
@ProxyCmp({inputs: ['dialCode', 'disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value']})
@Component({ selector: 'amplify-phone-field', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['dialCode', 'disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value'] })
export class AmplifyPhoneField {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyPhotoPicker extends Components.AmplifyPhotoPicker {}
@ProxyCmp({inputs: ['buttonText', 'handleClick', 'headerHint', 'headerTitle', 'placeholderHint', 'previewSrc']})
@Component({ selector: 'amplify-photo-picker', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['buttonText', 'handleClick', 'headerHint', 'headerTitle', 'placeholderHint', 'previewSrc'] })
export class AmplifyPhotoPicker {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyPicker extends Components.AmplifyPicker {}
@ProxyCmp({inputs: ['acceptValue', 'inputHandler', 'pickerText']})
@Component({ selector: 'amplify-picker', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['acceptValue', 'inputHandler', 'pickerText'] })
export class AmplifyPicker {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyRadioButton extends Components.AmplifyRadioButton {}
@ProxyCmp({inputs: ['checked', 'disabled', 'fieldId', 'handleInputChange', 'inputProps', 'label', 'name', 'placeholder', 'value']})
@Component({ selector: 'amplify-radio-button', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['checked', 'disabled', 'fieldId', 'handleInputChange', 'inputProps', 'label', 'name', 'placeholder', 'value'] })
export class AmplifyRadioButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyRequireNewPassword extends Components.AmplifyRequireNewPassword {}
@ProxyCmp({inputs: ['formFields', 'handleAuthStateChange', 'handleSubmit', 'headerText', 'submitButtonText', 'user']})
@Component({ selector: 'amplify-require-new-password', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['formFields', 'handleAuthStateChange', 'handleSubmit', 'headerText', 'submitButtonText', 'user'] })
export class AmplifyRequireNewPassword {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyS3Album extends Components.AmplifyS3Album {}
@ProxyCmp({inputs: ['contentType', 'fileToKey', 'filter', 'handleOnError', 'handleOnLoad', 'identityId', 'level', 'path', 'picker', 'pickerText', 'sort', 'track']})
@Component({ selector: 'amplify-s3-album', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['contentType', 'fileToKey', 'filter', 'handleOnError', 'handleOnLoad', 'identityId', 'level', 'path', 'picker', 'pickerText', 'sort', 'track'] })
export class AmplifyS3Album {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyS3Image extends Components.AmplifyS3Image {}
@ProxyCmp({inputs: ['alt', 'body', 'contentType', 'handleOnError', 'handleOnLoad', 'identityId', 'imgKey', 'imgProps', 'level', 'path', 'track']})
@Component({ selector: 'amplify-s3-image', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['alt', 'body', 'contentType', 'handleOnError', 'handleOnLoad', 'identityId', 'imgKey', 'imgProps', 'level', 'path', 'track'] })
export class AmplifyS3Image {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyS3ImagePicker extends Components.AmplifyS3ImagePicker {}
@ProxyCmp({inputs: ['buttonText', 'contentType', 'fileToKey', 'headerHint', 'headerTitle', 'identityId', 'level', 'path', 'placeholderHint', 'track']})
@Component({ selector: 'amplify-s3-image-picker', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['buttonText', 'contentType', 'fileToKey', 'headerHint', 'headerTitle', 'identityId', 'level', 'path', 'placeholderHint', 'track'] })
export class AmplifyS3ImagePicker {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyS3Text extends Components.AmplifyS3Text {}
@ProxyCmp({inputs: ['body', 'contentType', 'fallbackText', 'identityId', 'level', 'path', 'textKey', 'track']})
@Component({ selector: 'amplify-s3-text', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['body', 'contentType', 'fallbackText', 'identityId', 'level', 'path', 'textKey', 'track'] })
export class AmplifyS3Text {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyS3TextPicker extends Components.AmplifyS3TextPicker {}
@ProxyCmp({inputs: ['contentType', 'fallbackText', 'fileToKey', 'identityId', 'level', 'path', 'track']})
@Component({ selector: 'amplify-s3-text-picker', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['contentType', 'fallbackText', 'fileToKey', 'identityId', 'level', 'path', 'track'] })
export class AmplifyS3TextPicker {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifySection extends Components.AmplifySection {}
@ProxyCmp({inputs: ['role']})
@Component({ selector: 'amplify-section', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['role'] })
export class AmplifySection {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifySelect extends Components.AmplifySelect {}
@ProxyCmp({inputs: ['fieldId', 'handleInputChange', 'options', 'selected']})
@Component({ selector: 'amplify-select', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['fieldId', 'handleInputChange', 'options', 'selected'] })
export class AmplifySelect {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifySelectMfaType extends Components.AmplifySelectMfaType {}
@ProxyCmp({inputs: ['MFATypes', 'authData', 'handleSubmit']})
@Component({ selector: 'amplify-select-mfa-type', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['MFATypes', 'authData', 'handleSubmit'] })
export class AmplifySelectMfaType {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifySignIn extends Components.AmplifySignIn {}
@ProxyCmp({inputs: ['federated', 'formFields', 'handleAuthStateChange', 'handleSubmit', 'headerText', 'hideSignUp', 'submitButtonText', 'usernameAlias']})
@Component({ selector: 'amplify-sign-in', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['federated', 'formFields', 'handleAuthStateChange', 'handleSubmit', 'headerText', 'hideSignUp', 'submitButtonText', 'usernameAlias'] })
export class AmplifySignIn {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifySignInButton extends Components.AmplifySignInButton {}
@ProxyCmp({inputs: ['provider']})
@Component({ selector: 'amplify-sign-in-button', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['provider'] })
export class AmplifySignInButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifySignOut extends Components.AmplifySignOut {}
@ProxyCmp({inputs: ['buttonText', 'handleAuthStateChange']})
@Component({ selector: 'amplify-sign-out', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['buttonText', 'handleAuthStateChange'] })
export class AmplifySignOut {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifySignUp extends Components.AmplifySignUp {}
@ProxyCmp({inputs: ['formFields', 'handleAuthStateChange', 'handleSignUp', 'handleSubmit', 'haveAccountText', 'headerText', 'signInText', 'submitButtonText', 'usernameAlias', 'validationErrors']})
@Component({ selector: 'amplify-sign-up', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['formFields', 'handleAuthStateChange', 'handleSignUp', 'handleSubmit', 'haveAccountText', 'headerText', 'signInText', 'submitButtonText', 'usernameAlias', 'validationErrors'] })
export class AmplifySignUp {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyStrike extends Components.AmplifyStrike {}

@Component({ selector: 'amplify-strike', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>' })
export class AmplifyStrike {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyToast extends Components.AmplifyToast {}
@ProxyCmp({inputs: ['handleClose', 'message']})
@Component({ selector: 'amplify-toast', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['handleClose', 'message'] })
export class AmplifyToast {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyTooltip extends Components.AmplifyTooltip {}
@ProxyCmp({inputs: ['shouldAutoShow', 'text']})
@Component({ selector: 'amplify-tooltip', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['shouldAutoShow', 'text'] })
export class AmplifyTooltip {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyTotpSetup extends Components.AmplifyTotpSetup {}
@ProxyCmp({inputs: ['handleAuthStateChange', 'handleComplete', 'headerText', 'issuer', 'standalone', 'user']})
@Component({ selector: 'amplify-totp-setup', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['handleAuthStateChange', 'handleComplete', 'headerText', 'issuer', 'standalone', 'user'] })
export class AmplifyTotpSetup {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyUsernameField extends Components.AmplifyUsernameField {}
@ProxyCmp({inputs: ['disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value']})
@Component({ selector: 'amplify-username-field', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['disabled', 'fieldId', 'handleInputChange', 'hint', 'inputProps', 'label', 'placeholder', 'required', 'value'] })
export class AmplifyUsernameField {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

export declare interface AmplifyVerifyContact extends Components.AmplifyVerifyContact {}
@ProxyCmp({inputs: ['handleAuthStateChange', 'user']})
@Component({ selector: 'amplify-verify-contact', changeDetection: ChangeDetectionStrategy.OnPush, template: '<ng-content></ng-content>', inputs: ['handleAuthStateChange', 'user'] })
export class AmplifyVerifyContact {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}
