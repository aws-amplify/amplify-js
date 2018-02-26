import { NativeModules, DeviceEventEmitter, AsyncStorage, PushNotificationIOS, Platform } from 'react-native';
import { Logger, Analytics } from 'aws-amplify';

const logger = new Logger('Notification');

const RNPushNotification = NativeModules.RNPushNotification;
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
        this.updateEndpoint = this.updateEndpoint.bind(this);
        this.handleFCMCampaignPush = this.handleFCMCampaignPush.bind(this)
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

        if (Platform.OS === 'android') this.initializeAndroid();
        else if (Platform.OS === 'ios') this.initializeIOS();
    }

    onNotification(handler) {
        if (typeof handler === 'function') {
            //check platform
            if ( Platform.OS === 'ios' ) {
                PushNotificationIOS.addEventListener('notification', handler);
            } else {
                this.addEventListener(REMOTE_NOTIFICATION_RECEIVED, handler);   
            }
        }

    }

    onRegister(handler) {
        if (typeof handler === 'function') {
            //check platform
            if ( Platform.OS === 'ios' ) {
                PushNotificationIOS.addEventListener('register', handler);

            } else {
                this.addEventListener(REMOTE_TOKEN_RECEIVED, handler);   
            }
        }
    }

    initializeAndroid() {
        this.addEventListener(REMOTE_TOKEN_RECEIVED, this.updateEndpoint);
        this.addEventListener(REMOTE_NOTIFICATION_RECEIVED, this.handleFCMCampaignPush);
        RNPushNotification.initialize();
    }

    initializeIOS() {
        PushNotificationIOS.requestPermissions({
            alert: true,
            badge: true,
            sound: true
        });
        PushNotificationIOS.addEventListener('register', this.updateEndpoint);
    }

    handleFCMCampaignPush(message) {
        if (!message) {
            logger.debug('no message received for campaign push');
            return;
        }

        logger.debug('message is', message);
        const campaignData = message.data;
        logger.debug('campaignData is', campaignData);
        const attributes = {
            campaign_activity_id: campaignData['pinpoint.campaign.campaign_activity_id'],
            isAppInForeground: message.foreground? 'true' : 'false',
            treatment_id: campaignData['pinpoint.campaign.treatment_id'],
            campaign_id: campaignData['pinpoint.campaign.campaign_id']
        }

        const eventType = (message.foreground)?'_campaign.received_foreground':'_campaign.received_background';

        Analytics.record(eventType, attributes);
    }

    updateEndpoint(data) {
        let token = null;
        if (Platform.OS === 'android') {
            token = data? data.refreshToken: null;
            logger.debug('refresh token for android is', token);
        } else {
            token = data;
        }

        if (!token) {
            logger.debug('no device token recieved on register');
            return;
        }

        const { appId } = this._config;
        const cacheKey = 'fcm_token' + appId;
        logger.debug('update endpoint in push notification', data);
        AsyncStorage.getItem(cacheKey).then((lastToken) => {
            if (!lastToken || lastToken !== token) {
                logger.debug('refresh the device token with', token);
                const config = {
                    Address: token,
                    OptOut: 'NONE'
                }
                Analytics.updateEndpoint({Analytics: config}).then((data) => {
                    logger.debug('update endpoint success, setting token into cache')
                    AsyncStorage.setItem(cacheKey, token);
                }).catch(e => {
                    return;
                });
            }
        }).catch(e => {
            logger.debug('set device token in cache failed', e);
        });
    }

    // only for android
    addEventListener(event, handler) {
        listener = DeviceEventEmitter.addListener(event, function (data) {
            // for on notification
            if (event === REMOTE_NOTIFICATION_RECEIVED) {
                const dataObj = data.dataJSON? JSON.parse(data.dataJSON) : {};
                handler(dataObj);
                return;
            }
            if (event === REMOTE_TOKEN_RECEIVED) {
                const dataObj = data.dataJSON? JSON.parse(data.dataJSON) : {};
                handler(dataObj);
                return;
            }
        });
    }
}