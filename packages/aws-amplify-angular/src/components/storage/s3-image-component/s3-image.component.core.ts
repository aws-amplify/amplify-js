import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AmplifyService } from '../../../providers';

const template = `
  <img
    class="amplify-image"
    (click)="onImageClicked()"
    src="{{url}}"
  />
`;

@Component({
  selector: 'amplify-s3-image-core',
  template
})
export class S3ImageComponentCore {
  url: any;
  amplifyService: AmplifyService;

  @Output()
  selected: EventEmitter<string> = new EventEmitter<string>();

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
  }

  onImageClicked() {
    this.selected.emit(this.url);
  }

  @Input()
  set data(data:any){
    if (!data.imagePath) { return; }

    this.amplifyService.storage()
      .get(data.imagePath)
      .then(url => this.url = url)
      .catch(err => console.error(err));
  }

  @Input()
  set path(imagePath: string) {
    if (!imagePath) { return; }

    this.amplifyService.storage()
      .get(imagePath)
      .then(url => this.url = url)
      .catch(err => console.error(err));
  }
}
