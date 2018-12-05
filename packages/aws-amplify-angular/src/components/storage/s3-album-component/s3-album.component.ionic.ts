import { Component, Input, ViewEncapsulation, Injector, ElementRef } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { S3AlbumComponentCore } from './s3-album.component.core';

const template =  `
<div class="amplify-album">
  <div class="amplify-album-container">
    <amplify-s3-image-core
      class="amplify-image-container"
      *ngFor="let item of list"
      path="{{item.path}}"
      (selected)="onImageSelected($event)"
    ></amplify-s3-image-core>
  </div>
</div>
`;



@Component({
  selector: 'amplify-s3-album-ionic',
  template: template
})
export class S3AlbumComponentIonic extends S3AlbumComponentCore {

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
    
  }
}
