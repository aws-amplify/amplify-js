import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AmplifyService } from '../../../providers';

const template = `
<div class="amplify-album">
  <div class="amplify-album-container">
    <amplify-s3-image-core
      class="amplify-image-container"
      *ngFor="let item of list"
      path="{{item.path}}"
      [options]="_options"
      (selected)="onImageSelected($event)"
    ></amplify-s3-image-core>
  </div>
</div>
`;

@Component({
  selector: 'amplify-s3-album-core',
  template
})
export class S3AlbumComponentCore implements OnInit {
  list: Array<Object>;
  _path: string;
  _options: any = {
    level: 'public'
  };
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
    this._path = data.path;
    this._options = data.options;
  }

  @Input() set path(path: string) {
    this._path = path;
  }

  @Input() set options(options: any) {
    this._options = options;
  }
   ngOnInit() {
    this.getList(this._path, this._options);
  }

  getList(path, options) {
    if (!path) {return; }
    this.amplifyService.storage()
      .list(path, options)
      .then(data => {
        this.list = data.map(item => {
          return { path: item.key };
        });
      })
      .catch(e => console.error(e));
  }
}
