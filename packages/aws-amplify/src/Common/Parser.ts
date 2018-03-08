import { AmplifyConfig } from './types';
import { ConsoleLogger as Logger } from '../Common';

const logger = new Logger('Parser');

export default class Parser {
    static parseMobilehubConfig(config): AmplifyConfig {
        const amplifyConfig: AmplifyConfig = {};
        // Analytics
        if (config['aws_mobile_analytics_app_id']) {
            const Analytics = {};
            Analytics['appId'] = config['aws_mobile_analytics_app_id'];
            Analytics['region'] = config['aws_mobile_analytics_app_region'];
            amplifyConfig.Analytics = Analytics;
        }

        // Credentials
        if (config['aws_cognito_identity_pool_id']) {
            const Credentials = {};
            Credentials['cognitoIdentityPoolId'] = config['aws_cognito_identity_pool_id'];
            Credentials['cognitoRegion'] = config['aws_cognito_region'];
            Credentials['cognitoUserPoolId'] = config['aws_user_pools_id'];
            amplifyConfig.Credentials = Credentials
        }


        amplifyConfig.Analytics = Object.assign({}, amplifyConfig.Analytics, config.Analytics);
        amplifyConfig.Credentials = Object.assign({}, amplifyConfig.Credentials, config.Credentials);
        logger.debug('parse config', config, 'to amplifyconfig', amplifyConfig);
        
        return amplifyConfig;
    }
}
