import { AuthProvider } from '../types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import BaseProvider from './BaseProvider';

const logger = new Logger('DeveloperProvider');

export default class DeveloperProvider extends BaseProvider implements AuthProvider {
    constructor(options?) {
        super(options);
        this._credentialsDomain = 'cognito-identity.amazonaws.com';
    }

    public configure(options) {
        super.configure(options);
        const { refreshHandlers = {} } = this._config;

        this._refreshHandler = 
            refreshHandlers['developer'] || 
            refreshHandlers[this.getProviderName()];
    }

    public getProviderName() {
        return 'Developer';
    }
}
