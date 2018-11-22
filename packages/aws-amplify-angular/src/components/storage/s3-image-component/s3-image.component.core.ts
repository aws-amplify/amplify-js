import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
export class S3ImageComponentCore implements OnInit {
  url: any;
  _path: string;
  _options: any = {};
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
    if (!data.path) { return; }
    this._path = data.path;
    this._options = data.options;
  }

  @Input()
  set path(path: string) {
    this._path = path;
  }

  @Input()
  set options(options: any) {
    this._options = options;
  }

  ngOnInit() {
    if (!this._path) { return; }
    this.getImage(this._path, this._options);
  }

  getImage(path, options) {
    this.amplifyService.storage()
    .get(path, options)
    .then(url => this.url = url)
    .catch(e => console.error(e));
  }
}
