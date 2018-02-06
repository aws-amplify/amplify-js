import {
    AWS,
    Cognito,
    ConsoleLogger as Logger,
    Constants,
    Hub
} from '../Common';

import CognitoAuth from './CognitoAuth';

const dispatchAuthEvent = (event, data) => {
    Hub.dispatch('auth', { event, data }, 'Auth');
};

const logger = new Logger('Auth');

export default class Auth {
    private _config;
    private _pluggables;

    constructor() {
        this._config = {};
        this._pluggables = [];
        
        this._pluggables.push(new CognitoAuth());


    }

    public configure(config) {
        logger.debug('configure Auth');

        //const conf = Object.assign({}, this._config, Parser.parseMobilehubConfig(config).Analytics);
        const conf = Object.assign({}, this._config, config.Auth);

        
    }
}