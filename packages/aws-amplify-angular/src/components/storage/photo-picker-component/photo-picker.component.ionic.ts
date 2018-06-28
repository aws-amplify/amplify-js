import { Component, Input, ViewEncapsulation, Injector, ElementRef } from '@angular/core';

import { AmplifyService, AuthState } from '../../../providers';
import { PhotoPickerComponentCore } from './photo-picker.component.core';

const template = `
<div class="amplify-photo-picker-container">
  <div class="amplify-photo-picker-preview">
    <img
      class="amplify-photo-picker-preview"
      src="{{photoUrl}}"
      *ngIf="hasPhoto"
      (error)="onPhotoError()"
    />
  </div>
  <div>
    <input type="file" 
      class="amplify-upload-input"
      accept="image/*"
      (change)="pick($event)"/>
  </div>

</div>
`

@Component({
  selector: 'amplify-photo-picker-ionic',
  template: template
})
export class PhotoPickerIonicComponent extends PhotoPickerComponentCore {

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    super();
    
  }
}
