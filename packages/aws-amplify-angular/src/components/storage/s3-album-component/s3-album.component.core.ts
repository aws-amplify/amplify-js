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

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';

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
	template,
})
export class S3AlbumComponentCore implements OnInit {
	list: Array<Object>;
	_path: string;
	_options: any = {};
	protected logger: any;

	@Output()
	selected: EventEmitter<string> = new EventEmitter<string>();

	constructor(public amplifyService: AmplifyService) {
		this.logger = this.amplifyService.logger('S3AlbumComponent');
	}

	ngOnInit() {
		if (!this.amplifyService.storage()) {
			throw new Error(
				'Storage module not registered on AmplifyService provider'
			);
		}
		this.getList(this._path, this._options);
	}

	onImageSelected(event) {
		this.selected.emit(event);
	}

	@Input() set data(data: any) {
		if (!data.path) {
			return;
		}
		this._path = data.path;
		this._options = data.options;
	}

	@Input() set path(path: string) {
		this._path = path;
	}

	@Input() set options(options: any) {
		this._options = options;
	}

	getList(path, options) {
		if (!path) {
			return;
		}
		this.amplifyService
			.storage()
			.list(path, options)
			.then(data => {
				this.list = data.map(item => {
					return { path: item.key };
				});
			})
			.catch(e => console.error(e));
	}
}
