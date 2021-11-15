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
  <img
    class="amplify-image"
    (click)="onImageClicked()"
    src="{{url}}"
  />
`;

@Component({
	selector: 'amplify-s3-image-core',
	template,
})
export class S3ImageComponentCore implements OnInit {
	url: any;
	_path: string;
	_options: any = {};
	protected logger: any;

	@Output()
	selected: EventEmitter<string> = new EventEmitter<string>();

	constructor(public amplifyService: AmplifyService) {
		this.logger = this.amplifyService.logger('S3ImageComponent');
	}

	@Input()
	set data(data: any) {
		if (!data.path) {
			return;
		}
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
		if (!this._path) {
			return;
		}
		if (!this.amplifyService.storage()) {
			throw new Error(
				'Storage module not registered on AmplifyService provider'
			);
		}
		this.getImage(this._path, this._options);
	}

	onImageClicked() {
		this.selected.emit(this.url);
	}

	getImage(path, options) {
		this.amplifyService
			.storage()
			.get(path, options)
			.then((url) => (this.url = url))
			.catch((e) => console.error(e));
	}
}
