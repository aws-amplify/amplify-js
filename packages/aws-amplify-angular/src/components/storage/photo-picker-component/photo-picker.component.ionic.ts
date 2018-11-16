import { Component } from '@angular/core';

import { AmplifyService, AuthState } from '../../../providers';
import { PhotoPickerComponentCore } from './photo-picker.component.core';


const template = `
<div class="amplify-photo-picker">
<div class="amplify-photo-picker-container">
  <div class="amplify-form-header">Select Photos</div>
  <div class="amplify-photo-picker-upload" *ngIf="!hasPhoto"></div>
  <div class="amplify-photo-picker-preview">
    <img
      class="amplify-photo-picker-preview"
      src="{{photoUrl}}"
      *ngIf="hasPhoto"
      (error)="onPhotoError()"
    />
  </div>
  <div class="amplify-upload-input">
    <input type="file" 
      accept="image/*"
      (change)="pick($event)"/>
      <button 
        *ngIf="hasPhoto" 
        class="amplify-form-button amplify-upload-button" 
        (click)="uploadFile()">
        Upload Photo
      </button>
  </div>
</div>
<div class="amplify-alert" *ngIf="errorMessage">
  <div class="amplify-alert-body">
    <span class="amplify-alert-icon">&#9888;</span>
    <div class="amplify-alert-message">{{ errorMessage }}</div>
    <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
  </div>
</div>
</div>
`;

@Component({
  selector: 'amplify-photo-picker-ionic',
  template: template
})
export class PhotoPickerIonicComponent extends PhotoPickerComponentCore {

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
    
  }
}
