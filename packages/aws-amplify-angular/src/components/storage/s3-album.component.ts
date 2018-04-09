import { Component, Input } from '@angular/core';

import { AmplifyService } from '../../providers';
import AmplifyTheme from '../AmplifyTheme';

const template = `
<div [ngStyle]="theme.album.container">
  <amplify-s3-image
    *ngFor="let item of list"
    path="{{item.path}}"
    [theme]="theme"
  ></amplify-s3-image>
</div>
`;

@Component({
  selector: 'amplify-s3-album',
  template: template
})
export class S3AlbumComponent {
  list: Array<Object>;

  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
  }

  @Input()
  theme: any = AmplifyTheme;

  @Input() set path(path: string) {
    if (!path) { return; }

    const that = this;
    this.amplifyService.storage()
      .list(path)
      .then(data => {
        that.list = data.map(item => {
          return { path: item.key };
        });
      })
      .catch(err => console.log(err));
  }
}
