import { NativeModules, DeviceEventEmitter } from 'react-native';
import { Logger, Analytics } from 'aws-amplify';

const logger = new Logger('Notification');

const PinpointSNS = NativeModules.PinpointSNS;
const REMOTE_NOTIFICATION_RECEIVED = 'remoteNotificationReceived';
const REMOTE_TOKEN_RECEIVED = 'remoteTokenReceived';

export default class PushNotification {
    constructor(config) {
        if (config) {
            this.configure(config);
        } else {
            this._config = {};
        }
        this.handlers = [];
    }

    configure(config) {
        let conf = config ? config.PushNotification || config : {};

        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
                region: conf['aws_project_region'],
                identityPoolId: conf['aws_cognito_identity_pool_id']
            };
        }

        conf.region = 'us-east-1';
        this._config = Object.assign({}, this._config, conf);

        this.initialize();
    }

    onNotification(handler) {
        if (typeof handler === 'function') {
            this.addEventListener(REMOTE_NOTIFICATION_RECEIVED, handler);
        }

    }

    onRegister(handler) {
        if (typeof handler === 'function') {
            this.addEventListener(REMOTE_TOKEN_RECEIVED, handler);
        }
    }

    initialize() {
        const { appId, region, identityPoolId } = this._config;
        this.addEventListener(REMOTE_TOKEN_RECEIVED, this.updateEndpoint);
        PinpointSNS.initialize(appId, region, identityPoolId);
        
    }

    updateEndpoint(data) {
        const dataObj = data.dataJSON? JSON.parse(data.dataJSON) : {};
        console.log('update endpoint in push notification', dataObj);
        const token = dataObj ? dataObj.refreshToken : null;
        const config = {
            Address: token,
            OptOut: 'NONE'
        }

        Analytics.configure({Analytics: config});
    }

    addEventListener(event, handler) {
        listener = DeviceEventEmitter.addListener(event, function (data) {
            console.log(data);
            handler(data);
        });
    }
}