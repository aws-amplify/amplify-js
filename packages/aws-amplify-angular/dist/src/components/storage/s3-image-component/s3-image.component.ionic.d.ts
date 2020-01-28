import { AmplifyService } from '../../../providers/amplify.service';
import { S3ImageComponentCore } from './s3-image.component.core';
export declare class S3ImageComponentIonic extends S3ImageComponentCore {
    protected amplifyService: AmplifyService;
    constructor(amplifyService: AmplifyService);
}
