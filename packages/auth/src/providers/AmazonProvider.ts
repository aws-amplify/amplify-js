import { AuthProvider } from '../types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import BaseProvider from './BaseProvider';

const logger = new Logger('AmazonProvider');

export default class AmazonProvider extends BaseProvider implements AuthProvider {
    static NAME = 'Amazon';
    static DEFAULT_DOMAIN = 'www.amazon.com';

    constructor(options?) {
        super(options);
        this._credentialsDomain = AmazonProvider.DEFAULT_DOMAIN;
        this._credentialsTokenSource = BaseProvider.ACCESS_TOKEN;
    }

    public configure(options) {
        super.configure(options);
        const { refreshHandlers = {} } = this._config;

        this._refreshHandler = 
            this._refreshHandler || 
            refreshHandlers['amazon'];
    }

    public getProviderName() {
        return AmazonProvider.NAME;
    }
}
