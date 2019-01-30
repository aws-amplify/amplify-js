import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import Amplify from '@aws-amplify/core';

import AmplifyModules from './amplify.compose.service';

import { AuthState } from './auth.state';
import { authDecorator } from './auth.decorator';
import { AnySoaRecord } from 'dns';
import { AmplifyAuthService, AmplifyStorageService, AmplifyAPIService } from './modules'; 


// const base = (superclass) => new multi(superclass);

@Injectable()
export class AmplifyService extends AmplifyModules() {}
