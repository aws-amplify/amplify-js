import Auth from './Auth';
import Analytics from './Analytics';
import Storage from './Storage';
import API from './API';
import I18n from './I18n';
import Cache from './Cache';
import { ConsoleLogger as Logger, Hub, JS, ClientDevice, Signer } from './Common';
export default class Amplify {
    static Auth: any;
    static Analytics: any;
    static API: any;
    static Storage: any;
    static I18n: any;
    static Cache: any;
    static Logger: any;
    static configure(config: any): void;
}
export { Auth, Analytics, Storage, API, I18n, Logger, Hub, Cache, JS, ClientDevice, Signer };
