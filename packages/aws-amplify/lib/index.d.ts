<<<<<<< HEAD
import Auth from './Auth';
import Analytics, { AnalyticsProvider } from './Analytics';
import Storage from './Storage';
import API from './API';
=======
import Auth, { AuthClass } from './Auth';
import Analytics, { AnalyticsClass } from './Analytics';
import Storage, { StorageClass } from './Storage';
import API, { APIClass } from './API';
>>>>>>> upstream/master
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
    static Logger: any;
    static configure(config: any): any;
    static usePluggable(pluggable: any): void;
}
<<<<<<< HEAD
export { Auth, Analytics, Storage, API, I18n, Logger, Hub, Cache, JS, ClientDevice, Signer, AnalyticsProvider };
=======
export { Auth, Analytics, Storage, API, I18n, Logger, Hub, Cache, JS, ClientDevice, Signer };
export { AuthClass, AnalyticsClass, APIClass, StorageClass };
>>>>>>> upstream/master
