export declare class HubClass {
    name: any;
    bus: any[];
    listeners: {};
    constructor(name: any);
    static createHub(name: any): HubClass;
    dispatch(channel: any, payload: any, source?: string): void;
    listen(channel: any, listener: any, listenerName?: string): void;
    toListeners(capsule: any): void;
}
declare const Hub: HubClass;
export default Hub;
