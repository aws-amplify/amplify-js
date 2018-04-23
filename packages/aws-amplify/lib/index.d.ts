import Analytics, { AnalyticsClass, AnalyticsProvider } from './Analytics';
import Auth, { AuthClass } from './Auth';
import Storage, { StorageClass } from './Storage';
import API, { APIClass, graphqlOperation } from './API';
import PubSub from './PubSub';
import I18n from './I18n';
import Cache from './Cache';
import { ConsoleLogger as Logger, Hub, JS, ClientDevice, Signer } from './Common';
export default class Amplify {
    static Auth: AuthClass;
    static Analytics: AnalyticsClass;
    static API: APIClass;
    static Storage: StorageClass;
    static I18n: any;
    static Cache: any;
    static PubSub: any;
    static Logger: any;
    static configure(config: any): any;
    static addPluggable(pluggable: any): void;
}
export { Auth, Analytics, Storage, API, PubSub, I18n, Logger, Hub, Cache, JS, ClientDevice, Signer };
export { AuthClass, AnalyticsClass, APIClass, StorageClass, AnalyticsProvider };
export { graphqlOperation };
