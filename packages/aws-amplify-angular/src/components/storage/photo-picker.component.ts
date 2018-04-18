import { Component, Input, Output, EventEmitter } from '@angular/core';

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
  selector: 'amplify-photo-picker',
  template: template
})
export class PhotoPickerComponent {
  photoUrl: string;
  hasPhoto: boolean = false;
  
  @Input()
  set url(url: string) {
    this.photoUrl = url;
    this.hasPhoto = true;
  }

  @Output()
  picked: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  loaded: EventEmitter<string> = new EventEmitter<string>();

  pick(evt) {
    const file = evt.target.files[0];
    if (!file) { return; }

    const { name, size, type } = file;
    this.picked.emit(file);

    const that = this;
    const reader = new FileReader();
    reader.onload = function(e) {
      const target: any = e.target;
      const url = target.result;
      that.photoUrl = url;
      that.hasPhoto = true;
      that.loaded.emit(url);
    }
    reader.readAsDataURL(file);
  }

  onPhotoError() {
    this.hasPhoto = false;
  }
}
