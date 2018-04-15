import { Component, Input } from '@angular/core';
import { AmplifyService } from '../../providers';

const template = `
  <img
    class="amplify-image"
    src="{{url}}"
  />
`;

@Component({
  selector: 'amplify-s3-image',
  template: template
})
export class S3ImageComponent {
  url: any;
  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
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
