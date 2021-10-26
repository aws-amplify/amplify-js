import { Component, Input, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { ConfirmSignInComponentCore } from './confirm-sign-in-component.core';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-form-container" *ngIf="_show" data-test="${auth.confirmSignIn.section}">
  <div class="amplify-form-body" data-test="${auth.confirmSignIn.bodySection}">
    <div
      class="amplify-form-header amplify-form-header-ionic"
      data-test="${auth.confirmSignIn.headerSection}"
      >
        {{ this.amplifyService.i18n().get('Confirm your sign in code') }}
    </div>
    <ion-list>
      <ion-item lines="none">
        <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">
          {{ this.amplifyService.i18n().get('Code *') }}
        </ion-label>
        <ion-input
          #code
          type="text"
          class="amplify-form-input"
          (input)="setCode(code.value)"
          (keyup.enter)="onConfirm()"
          data-test="${auth.confirmSignIn.codeInput}"
        ></ion-input>
      </ion-item>
    </ion-list>

    <div class="amplify-form-actions">
      <div>
        <ion-button expand="block" color="primary"
          (click)="onConfirm()"
          data-test="${auth.confirmSignIn.confirmButton}"
        >{{ this.amplifyService.i18n().get('Confirm Code') }}</ion-button>
      </div>
    </div>
  </div>

  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ this.amplifyService.i18n().get(errorMessage) }}</div>
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
  </div>

</div>
`;

@Component({
	selector: 'amplify-auth-confirm-sign-in-ionic',
	template,
})
export class ConfirmSignInComponentIonic extends ConfirmSignInComponentCore {
	_authState: AuthState;
	_show: boolean;
	code: string;
	errorMessage: string;

	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		super(amplifyService);
	}
}
