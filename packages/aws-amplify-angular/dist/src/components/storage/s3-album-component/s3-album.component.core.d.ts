import { EventEmitter, OnInit } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
export declare class S3AlbumComponentCore implements OnInit {
    protected amplifyService: AmplifyService;
    list: Array<Object>;
    _path: string;
    _options: any;
    protected logger: any;
    selected: EventEmitter<string>;
    constructor(amplifyService: AmplifyService);
    ngOnInit(): void;
    onImageSelected(event: any): void;
    data: any;
    path: string;
    options: any;
    getList(path: any, options: any): void;
}
