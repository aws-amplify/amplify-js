import { Component, Input } from '@angular/core';

import { AmplifyService } from '../../providers';
import AmplifyTheme from '../AmplifyTheme';

const template = `
<div [ngStyle]="theme.image.container">
  <img
    [ngStyle]="theme.image.image"
    src="{{url}}"
  />
</div>
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
  theme: any = AmplifyTheme;

  @Input()
  set path(imagePath: string) {
    if (!imagePath) { return; }

    this.amplifyService.storage()
      .get(imagePath)
      .then(url => this.url = url)
      .catch(err => console.log(err));
  }
}
