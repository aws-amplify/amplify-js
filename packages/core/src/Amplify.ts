import { ConsoleLogger as LoggerClass } from './Logger';

const logger = new LoggerClass('Amplify');

export default class Amplify {
    private static _components = [];
    private static _config = {};

    // for backward compatibility to avoid breaking change
    // if someone is using like Amplify.Auth
    static Auth = null;
    static Analytics = null;
    static API = null;
    static Storage = null;
    static I18n = null;
    static Cache = null;
    static PubSub = null;
    static Interactions = null;
    static Pushnotification = null;
    static UI = null;
    static XR = null;

    static Logger = LoggerClass;
    static ServiceWorker = null;

    static register(comp) {
        logger.debug('component registered in amplify', comp);
        this._components.push(comp);
        if (typeof comp.getModuleName === 'function') {
            Amplify[comp.getModuleName()] = comp;
        } else {
            logger.debug('no getModuleName method for component', comp);
        }
    }

    static configure(config) {
        if (!config) return this._config;

        this._config = Object.assign(this._config, config);
        logger.debug('amplify config', this._config);
        this._components.map(comp => {
            comp.configure(this._config);
        });

        return this._config;
    }

    static addPluggable(pluggable) {
        if (pluggable && pluggable['getCategory'] && typeof pluggable['getCategory'] === 'function') {
            this._components.map(comp => {
                if (comp['addPluggable'] && typeof comp['addPluggable'] === 'function') {
                    comp.addPluggable(pluggable);
                }
            });
        }
    }
}
