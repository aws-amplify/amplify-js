import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';

const template = `
<div class="amplify-photo-picker">
<div class="amplify-photo-picker-container">
  <div class="amplify-form-header">Select Photos</div>
  <div class="amplify-photo-picker-upload" *ngIf="!hasPhoto"></div>
  <div class="amplify-photo-picker-preview">
    <img
      class="amplify-photo-picker-preview"
      src="{{photoUrl}}"
      *ngIf="hasPhoto"
      (error)="onPhotoError()"
    />
  </div>
  <div class="amplify-upload-input">
    <input type="file" 
      accept="image/*"
      (change)="pick($event)"/>
      <button 
        *ngIf="hasPhoto" 
        class="amplify-form-button amplify-upload-button" 
        (click)="uploadFile()">
        Upload Photo
      </button>
  </div>
</div>
<div class="amplify-alert" *ngIf="errorMessage">
  <div class="amplify-alert-body">
    <span class="amplify-alert-icon">&#9888;</span>
    <div class="amplify-alert-message">{{ errorMessage }}</div>
    <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
  </div>
</div>
</div>
`

@Component({
  selector: 'amplify-photo-picker-core',
  template: template
})
export class PhotoPickerComponentCore {
  photoUrl: string;
  path: string;
  hasPhoto: boolean = false;
  uploading: boolean = false;
  s3ImagePath: string = "";
  s3ImageFile: any = null;
  errorMessage: string;
  
  @Input()
  set url(url: string) {
    this.photoUrl = url;
    this.hasPhoto = true;
  }

  @Input()
  set data(data: any) {
    this.photoUrl = data.url;
    this.path = data.path;
    this.hasPhoto = true;
  }

  @Output()
  picked: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  loaded: EventEmitter<string> = new EventEmitter<string>();
  
  constructor( private amplify: AmplifyService ) {

  }

  pick(evt) {
    const file = evt.target.files[0];
    if (!file) { return; }

    const { name, size, type } = file;
    this.picked.emit(file);

    this.s3ImagePath = `${this.path}/${file.name}`;
    this.s3ImageFile = file;
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

  uploadFile() {
  	this.uploading = true;
  	this.amplify.storage().put( 
  			this.s3ImagePath, 
  			this.s3ImageFile, {
    			'contentType': this.s3ImageFile.type
		})
		.then ( result => {
			this.completeFileUpload();
		})
		.catch( error => {
			this.completeFileUpload(error);
		});
  }

  completeFileUpload(error?:any) {
  	if (error) {
  		return this._setError(error);
  	}
  	this.s3ImagePath = "";
  	this.s3ImageFile = null;
	  this.uploading = false;
  }

  onPhotoError() {
    this.hasPhoto = false;
  }

  onAlertClose() {
    this._setError(null);
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }
    this.errorMessage = err.message || err;
  }
}
