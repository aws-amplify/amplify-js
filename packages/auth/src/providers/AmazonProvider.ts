import { AuthProvider } from '../types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import BaseProvider from './BaseProvider';

const logger = new Logger('AmazonProvider');

export default class AmazonProvider extends BaseProvider implements AuthProvider {
    constructor(options?) {
        super(options);
        this._credentialsDomain = 'www.amazon.com';
    }

    public configure(options) {
        super.configure(options);
        const { refreshHandlers } = this._config;

        this._refreshHandler = 
            refreshHandlers['amazon'] || 
            refreshHandlers[this.getProviderName()];
    }

    public getProviderName() {
        return 'Amazon';
    }
}
