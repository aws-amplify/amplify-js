import {
	AmplifyUserSession,
	FrontendConfig,
	GetUserSessionOptions,
	ResourceConfig,
} from './types';
import { Hub } from './Hub';
import { Observable } from 'rxjs';

let _resourcesConfig: ResourceConfig | undefined;
const _frontendConfig: FrontendConfig = { Auth: {} };

export const Amplify = {
	configure(resources: ResourceConfig, frontendConfig?: FrontendConfig): void {
		_resourcesConfig = resources;
		if (frontendConfig) {
			if (frontendConfig?.Auth === null) {
				_frontendConfig.Auth = {};
			} else if (frontendConfig?.Auth) {
				_frontendConfig.Auth = frontendConfig.Auth;
			}
		}

		Hub.dispatch(
			'core',
			{
				event: 'configure',
				data: _resourcesConfig,
			},
			'Configure'
		);
	},
	getConfig(): ResourceConfig {
		return { ..._resourcesConfig };
	},
	// TODO: Add more cross category functionality
	Auth: {
		async getUserSession(
			options?: GetUserSessionOptions
		): Promise<AmplifyUserSession> {
			if (!_frontendConfig?.Auth?.sessionProvider) {
				throw new Error('No user session provider configured');
			}
			return await _frontendConfig.Auth.sessionProvider.getUserSession({
				refresh: options?.refresh,
			});
		},
		listenUserSession(): Observable<AmplifyUserSession> {
			if (_frontendConfig?.Auth?.sessionProvider?.listenUserSession) {
				return _frontendConfig.Auth.sessionProvider.listenUserSession();
			} else {
				throw new Error('No user session provider configured');
			}
		},
	},
};

Object.freeze(Amplify);
