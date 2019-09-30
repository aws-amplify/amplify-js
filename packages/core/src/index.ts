/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { AWS } from './Facet';
import { ConsoleLogger as Logger } from './Logger';
import { Amplify } from './Amplify';
import { Platform } from './Platform';

export * from './Facet';
export { ClientDevice } from './ClientDevice';
export { ConsoleLogger, ConsoleLogger as Logger } from './Logger';
export * from './Errors';
export { Hub } from './Hub';
export { I18n } from './I18n';
export * from './JS';
export { Signer } from './Signer';
export * from './Parser';
export { FacebookOAuth, GoogleOAuth } from './OAuthHelper';
export * from './RNComponents';
export { Credentials } from './Credentials';
export { ServiceWorker } from './ServiceWorker';
export { ICredentials } from './types';
export { StorageHelper, MemoryStorage } from './StorageHelper';
export { Platform } from './Platform';
export * from './constants';

export const Constants = {
	userAgent: Platform.userAgent,
};

export { Amplify };
/**
 * @deprecated use named import
 */
export default Amplify;

const logger = new Logger('Core');

if (AWS['util']) {
	AWS['util'].userAgent = () => {
		return Constants.userAgent;
	};
} else if (AWS.config) {
	AWS.config.update({ customUserAgent: Constants.userAgent });
} else {
	logger.warn('No AWS.config');
}
