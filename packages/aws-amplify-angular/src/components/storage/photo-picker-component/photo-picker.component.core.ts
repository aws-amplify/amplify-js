// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
// tslint:enable

import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit,
	Inject,
} from '@angular/core';
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
`;

@Component({
	selector: 'amplify-photo-picker-core',
	template,
})
export class PhotoPickerComponentCore implements OnInit {
	photoUrl: string;
	hasPhoto: boolean = false;
	uploading: boolean = false;
	s3ImageFile: any = null;
	s3ImagePath: string = '';
	_storageOptions: any = {};
	errorMessage: string;
	protected logger: any;

	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		this.logger = this.amplifyService.logger('PhotoPickerComponent');
	}

	@Input()
	set url(url: string) {
		this.photoUrl = url;
		this.hasPhoto = true;
	}

	@Input()
	set storageOptions(storageOptions: any) {
		this._storageOptions = Object.assign(this._storageOptions, storageOptions);
	}

	@Input()
	set path(path: string) {
		this.s3ImagePath = path;
	}

	@Input()
	set data(data: any) {
		this.photoUrl = data.url;
		this.s3ImagePath = data.path;
		this._storageOptions = Object.assign(
			this._storageOptions,
			data.storageOptions
		);
		this.hasPhoto = true;
	}

	@Output()
	picked: EventEmitter<string> = new EventEmitter<string>();

	@Output()
	loaded: EventEmitter<string> = new EventEmitter<string>();

	@Output()
	uploaded: EventEmitter<Object> = new EventEmitter<Object>();

	ngOnInit() {
		if (!this.amplifyService.storage()) {
			throw new Error(
				'Storage module not registered on AmplifyService provider'
			);
		}
	}

	pick(evt) {
		const file = evt.target.files[0];
		if (!file) {
			return;
		}
		if (!this._storageOptions.contentType) {
			this._storageOptions.contentType = file.type;
		}
		const { name, size, type } = file;
		this.picked.emit(file);

		this.s3ImagePath = `${this.s3ImagePath}/${file.name}`;
		this.s3ImageFile = file;
		const that = this;
		const reader = new FileReader();
		reader.onload = function (e) {
			const target: any = e.target;
			const url = target.result;
			that.photoUrl = url;
			that.hasPhoto = true;
			that.loaded.emit(url);
		};
		reader.readAsDataURL(file);
	}

	uploadFile() {
		this.uploading = true;
		this.amplifyService
			.storage()
			.put(this.s3ImagePath, this.s3ImageFile, this._storageOptions)
			.then((result) => {
				this.uploaded.emit(result);
				this.completeFileUpload();
			})
			.catch((error) => {
				this.completeFileUpload(error);
			});
	}

	completeFileUpload(error?: any) {
		if (error) {
			return this._setError(error);
		}
		this.s3ImagePath = '';
		this.photoUrl = null;
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
