import { Component, Input, ViewEncapsulation, Injector, ElementRef } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { S3ImageComponentCore } from './s3-image.component.core';

const template = `
  <img
    class="amplify-image"
    (click)="onImageClicked()"
    src="{{url}}"
  />
`;

@Component({
  selector: 'amplify-s3-image-ionic',
  template: template
})
export class S3ImageComponentIonic extends S3ImageComponentCore {

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
    
  }
}
