import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { CognitoAuth } from 'amazon-cognito-auth-js';
import { Linking } from 'react-native';

CognitoAuth.prototype.createCORSRequest = (method: string, url: string) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    return xhr;
};


(global as any).atob = (global as any).atob
    || ((payload: string) => {
        const { Buffer } = require('buffer');

        return Buffer.from(payload, 'base64').toString('utf8');
    });


CognitoAuth.prototype.launchUri = async (url: string) => {
    const logger = new Logger('CognitoAuth.launchUri');

    logger.debug({ launchUri: url });

    return await Linking.openURL(url);
};
