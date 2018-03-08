export default class Credentials {
    private _config;
    private _pluggables;
    constructor();
    configure(config: any): any;
    addPluggable(pluggable: any): any;
    setCredentials(config?: any): Promise<{}>;
    removeCredentials(config?: any): void;
    essentialCredentials(params: any): any;
    getCredentials(config?: any): Promise<{}>;
}
