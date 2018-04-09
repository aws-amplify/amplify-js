import { Component, Input, Output, EventEmitter } from '@angular/core';

import AmplifyTheme from '../AmplifyTheme';

const template = `
<div [ngStyle]="theme.photoPicker.container">
  <div [ngStyle]="theme.photoPicker.preview">
    <img
      [ngStyle]="theme.photoPicker.previewImg"
      src="{{photoUrl}}"
      *ngIf="hasPhoto"
      (error)="onPhotoError()"
    />
  </div>
  <div [ngStyle]="theme.photoPicker.button">Pick a Photo</div>
  <input
    title="Pick"
    type="file" accept="image/*"
    [ngStyle]="theme.photoPicker.picker"
    (change)="pick($event)"
  />
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
  theme: any = AmplifyTheme;

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
    console.log('photo error');
    this.hasPhoto = false;
  }
}
