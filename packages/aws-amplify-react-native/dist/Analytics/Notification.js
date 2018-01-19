import { NativeModules, DeviceEventEmitter } from 'react-native';
import { consoleLogger as Logger } from '../Common';

const logger = new Logger('Notification');

const PinpointSNS = NativeModules.PinpointSNS;
const REMOTE_NOTIFICATION_RECEIVED = 'remoteNotificationReceived';

export default class Notification {
    constructor(config) {
        if (config) {
            this.configure(config);
        } else {
            this._config = {};
        }
    }

    configure(config) {
        let conf = config ? config.Notification || config : {};

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
        this.addEventListener(REMOTE_NOTIFICATION_RECEIVED);
    }

    initialize() {
        const conf = this._config;
        PinpointSNS.initialize(conf.appId, conf.region, conf.identityPoolId);
    }

    addEventListener(event) {
        listener = DeviceEventEmitter.addListener(event, function (data) {
            console.log(data);
        });
    }
}