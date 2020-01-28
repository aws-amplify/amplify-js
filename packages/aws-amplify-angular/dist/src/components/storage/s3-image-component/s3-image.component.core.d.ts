import { EventEmitter, OnInit } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
export declare class S3ImageComponentCore implements OnInit {
    protected amplifyService: AmplifyService;
    url: any;
    _path: string;
    _options: any;
    protected logger: any;
    selected: EventEmitter<string>;
    constructor(amplifyService: AmplifyService);
    data: any;
    path: string;
    options: any;
    ngOnInit(): void;
    onImageClicked(): void;
    getImage(path: any, options: any): void;
}
