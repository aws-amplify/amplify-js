import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AmplifyService } from '../../../providers';

const template = `
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
  selector: 'amplify-s3-album-core',
  template
})
export class S3AlbumComponentCore {
  list: Array<Object>;

  amplifyService: AmplifyService;

  @Output()
  selected: EventEmitter<string> = new EventEmitter<string>();

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
  }

  onImageSelected(event) {
    this.selected.emit(event);
  }

  @Input() set data(data: any){
    if (!data.path) { return; }
    const that = this;
    this.amplifyService.storage()
      .list(data.path)
      .then(res => {
        that.list = res.map(item => {
          return { path: item.key };
        });
      })
      .catch(err => console.error(err));
  }

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
      .catch(err => console.error(err));
  }
}
