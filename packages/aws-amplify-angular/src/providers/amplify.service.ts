import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import Amplify from '@aws-amplify/core';

import multi from './amplify.service.multihelper';

import { AuthState } from './auth.state';
import { authDecorator } from './auth.decorator';
import { AnySoaRecord } from 'dns';
import { AmplifyAuthService, AmplifyStorageService } from './modules'; 


const base = (superclass) => new multi(superclass);

@Injectable()
export class AmplifyService extends base(class AmplifyBase {})
.with(AmplifyAuthService, AmplifyStorageService) {}

